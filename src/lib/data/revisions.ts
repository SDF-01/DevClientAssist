import type {
  ClarificationMessage,
  Project,
  RevisionAttachment,
  RevisionEvent,
  RevisionExport,
  RevisionItemRecord,
  RevisionPriority,
  RevisionRequest,
  RevisionRequestWithRelations,
  RevisionStatus,
} from '@/types/database'
import type { ReferenceImage, StructuredRevisionRequest } from '@/types/revision'
import { logAnalyticsEvent } from '@/lib/analytics'
import { calculateCompletenessScore } from '@/lib/completenessScore'
import { wrapChatGptBrief } from '@/lib/chatgptBrief'
import { exportRevisionToToon, validateToonStrict } from '@/lib/toonExporter'
import { isSupabaseConfigured, STORAGE_BUCKET, supabase } from '@/lib/supabase/client'
import {
  localAddEvent,
  localAddExport,
  localAddMessage,
  localGetRevision,
  localListRevisions,
  localSaveRevision,
  localUpdateRevisionItems,
  localUpdateRevisionStatus,
} from './localStore'
import { getProject } from './projects'
import { toDatabaseUuid } from '@/lib/ids'

export interface SubmitRevisionPayload {
  projectId: string
  rawRequest: string
  images: ReferenceImage[]
  contactName?: string
  contactEmail?: string
  urgency?: RevisionPriority
  dueDate?: string
  clientNotes?: string
  formattedBrief?: string
  userId?: string | null
  asDraft?: boolean
}

function mapStructuredToItems(revisionId: string, structured: StructuredRevisionRequest): RevisionItemRecord[] {
  return structured.revisions.map((item) => ({
    id: toDatabaseUuid(item.id),
    revision_id: revisionId,
    order_index: item.order,
    category: item.category,
    priority: item.priority,
    summary: item.summary,
    details: item.details,
    acceptance_criteria: item.acceptanceCriteria,
    created_at: new Date().toISOString(),
  }))
}

function safeFileExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'png'
  return /^[a-z0-9]{1,8}$/.test(ext) ? ext : 'png'
}

function blobFromDataUrl(dataUrl: string, mimeType: string): Blob {
  if (!dataUrl.startsWith('data:')) {
    throw new Error('Screenshot data is missing.')
  }
  const comma = dataUrl.indexOf(',')
  const header = comma >= 0 ? dataUrl.slice(0, comma) : ''
  const payload = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
  const binary = header.includes(';base64') ? atob(payload) : decodeURIComponent(payload)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new Blob([bytes], { type: mimeType || 'image/png' })
}

function localAttachment(
  revisionId: string,
  storagePath: string,
  image: ReferenceImage,
  publicUrl: string,
): RevisionAttachment {
  return {
    id: crypto.randomUUID(),
    revision_id: revisionId,
    storage_path: storagePath,
    file_name: image.name,
    mime_type: image.mimeType,
    size_bytes: image.sizeBytes,
    caption: image.caption,
    annotation_data: image.annotationData ?? null,
    public_url: publicUrl,
    created_at: new Date().toISOString(),
  }
}

async function uploadAttachments(
  revisionId: string,
  orgId: string,
  projectId: string,
  images: ReferenceImage[],
): Promise<RevisionAttachment[]> {
  const attachments: RevisionAttachment[] = []

  for (const image of images) {
    const ext = safeFileExtension(image.name)
    const storagePath = `${orgId}/${projectId}/${revisionId}/${crypto.randomUUID()}.${ext}`

    if (isSupabaseConfigured && supabase && image.dataUrl.startsWith('data:')) {
      try {
        const blob = blobFromDataUrl(image.dataUrl, image.mimeType)
        const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, blob, {
          contentType: image.mimeType || 'image/png',
          upsert: false,
        })
        if (error) throw error

        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)
        attachments.push(localAttachment(revisionId, storagePath, image, urlData.publicUrl))
        continue
      } catch {
        attachments.push(localAttachment(revisionId, storagePath, image, image.dataUrl))
        continue
      }
    }

    attachments.push(localAttachment(revisionId, storagePath, image, image.dataUrl))
  }

  return attachments
}

export function submitErrorMessage(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
        ? error.message
        : ''
  const message = raw.toLowerCase()

  if (message.includes('toon') && (message.includes('paste') || message.includes('upload'))) {
    return raw
  }
  if (message.includes('project not found')) {
    return 'Choose a project before sending.'
  }
  if (
    message.includes('row-level security') ||
    message.includes('permission') ||
    message.includes('not allowed') ||
    message.includes('unauthorized')
  ) {
    return 'Could not save the request. Sign in and try again, or ask the site owner for access.'
  }
  if (message.includes('bucket') || message.includes('storage') || message.includes('mime') || message.includes('upload')) {
    return 'Could not upload a screenshot. Send the request without pictures, or try a smaller PNG or JPG.'
  }
  if (message.includes('foreign key') || message.includes('submitted_by')) {
    return 'Your account is missing a profile, so the request could not be saved. Sign out and send it again, or ask the owner to approve the account.'
  }
  if (message.includes('invalid input syntax for type uuid')) {
    return 'Could not save the request. Try sending it again.'
  }
  return raw.trim() || 'Could not send the request.'
}

export async function submitRevision(payload: SubmitRevisionPayload): Promise<RevisionRequestWithRelations> {
  const project = await getProject(payload.projectId)
  if (!project) throw new Error('Project not found')

  if (!payload.formattedBrief?.trim()) {
    throw new Error('Paste or upload the ChatGPT .toon file before sending.')
  }

  const structured = wrapChatGptBrief({
    appId: project.slug,
    appName: project.name,
    appDescription: project.description,
    rawRequest: payload.rawRequest,
    formattedBrief: payload.formattedBrief,
    images: payload.images,
    urgency: payload.urgency,
  })
  const completeness = calculateCompletenessScore(payload.rawRequest, payload.images, structured)
  const revisionId = crypto.randomUUID()
  const now = new Date().toISOString()

  const revision: RevisionRequest = {
    id: revisionId,
    organization_id: project.organization_id,
    project_id: project.id,
    submitted_by: payload.userId ?? null,
    assignee_id: null,
    status: payload.asDraft ? 'draft' : 'submitted',
    title: structured.instructions.title,
    raw_request: payload.rawRequest,
    structured_payload: structured as unknown as Record<string, unknown>,
    internal_notes: null,
    client_notes: payload.clientNotes ?? null,
    contact_name: payload.contactName ?? null,
    contact_email: payload.contactEmail ?? null,
    urgency: payload.urgency ?? 'medium',
    due_date: payload.dueDate ?? null,
    version: 1,
    parent_revision_id: null,
    completeness_score: completeness.score,
    created_at: now,
    updated_at: now,
    submitted_at: payload.asDraft ? null : now,
  }

  const items = mapStructuredToItems(revisionId, structured)
  const event: RevisionEvent = {
    id: crypto.randomUUID(),
    revision_id: revisionId,
    actor_id: payload.userId ?? null,
    event_type: payload.asDraft ? 'draft_saved' : 'submitted',
    payload: { completeness: completeness.score },
    created_at: now,
  }

  if (isSupabaseConfigured && supabase) {
    const { error: revError } = await supabase.from('revision_requests').insert(revision)
    if (revError) {
      const canRetryWithoutSubmitter =
        Boolean(revision.submitted_by) && /foreign key|submitted_by/i.test(revError.message)
      if (!canRetryWithoutSubmitter) throw revError

      const { error: retryError } = await supabase
        .from('revision_requests')
        .insert({ ...revision, submitted_by: null })
      if (retryError) throw retryError
    }

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from('revision_items').insert(items)
      if (itemsError) throw itemsError
    }

    await supabase.from('revision_events').insert(event)
  }

  const attachments = await uploadAttachments(revisionId, project.organization_id, project.id, payload.images)

  if (isSupabaseConfigured && supabase) {
    if (attachments.length > 0) {
      const { error: attError } = await supabase.from('revision_attachments').insert(attachments)
      if (attError) {
        const withoutDataUrls = attachments.map((attachment) => ({
          ...attachment,
          public_url: attachment.public_url?.startsWith('data:') ? null : attachment.public_url,
          annotation_data: attachment.annotation_data?.startsWith('data:') ? null : attachment.annotation_data,
        }))
        const { error: fallbackError } = await supabase.from('revision_attachments').insert(withoutDataUrls)
        if (fallbackError) throw fallbackError
      }
    }
  } else {
    localSaveRevision({ revision, items, attachments, event })
  }

  logAnalyticsEvent('revision_submitted', { revisionId, projectId: project.id, completeness: completeness.score })

  // Notify team via edge function when configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (supabaseUrl && anonKey && !payload.asDraft) {
    void fetch(`${supabaseUrl}/functions/v1/notify-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anonKey}` },
      body: JSON.stringify({
        revisionId,
        title: revision.title,
        projectName: project.name,
        contactEmail: payload.contactEmail,
      }),
    })
  }

  return (await getRevision(revisionId))!
}

export async function listRevisions(filters?: { status?: RevisionStatus }): Promise<RevisionRequestWithRelations[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('revision_requests').select('*').order('created_at', { ascending: false })
    if (filters?.status) query = query.eq('status', filters.status)
    const { data, error } = await query
    if (error) throw error

    const revisions = data as RevisionRequest[]
    const enriched = await Promise.all(revisions.map((r) => getRevision(r.id)))
    return enriched.filter(Boolean) as RevisionRequestWithRelations[]
  }
  return localListRevisions(filters)
}

export async function getRevision(id: string): Promise<RevisionRequestWithRelations | null> {
  if (isSupabaseConfigured && supabase) {
    const { data: revision, error } = await supabase.from('revision_requests').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!revision) return null

    const [projectRes, itemsRes, attachmentsRes, eventsRes, messagesRes] = await Promise.all([
      supabase.from('projects').select('*').eq('id', revision.project_id).maybeSingle(),
      supabase.from('revision_items').select('*').eq('revision_id', id).order('order_index'),
      supabase.from('revision_attachments').select('*').eq('revision_id', id),
      supabase.from('revision_events').select('*').eq('revision_id', id).order('created_at'),
      supabase.from('clarification_messages').select('*').eq('revision_id', id).order('created_at'),
    ])

    return {
      ...(revision as RevisionRequest),
      project: projectRes.data as Project | undefined,
      items: (itemsRes.data ?? []) as RevisionItemRecord[],
      attachments: (attachmentsRes.data ?? []) as RevisionAttachment[],
      events: (eventsRes.data ?? []) as RevisionEvent[],
      messages: (messagesRes.data ?? []) as ClarificationMessage[],
    }
  }
  return localGetRevision(id)
}

export async function updateRevisionStatus(
  id: string,
  status: RevisionStatus,
  actorId: string | null,
): Promise<RevisionRequestWithRelations | null> {
  const now = new Date().toISOString()

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('revision_requests').update({ status, updated_at: now }).eq('id', id)
    if (error) throw error

    await supabase.from('revision_events').insert({
      id: crypto.randomUUID(),
      revision_id: id,
      actor_id: actorId,
      event_type: 'status_changed',
      payload: { to: status },
      created_at: now,
    })
  } else {
    localUpdateRevisionStatus(id, status, actorId)
  }

  logAnalyticsEvent('revision_status_changed', { revisionId: id, status })
  return getRevision(id)
}

export async function updateRevisionItems(revisionId: string, items: RevisionItemRecord[]) {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('revision_items').delete().eq('revision_id', revisionId)
    if (items.length > 0) {
      const { error } = await supabase.from('revision_items').insert(items)
      if (error) throw error
    }
  } else {
    localUpdateRevisionItems(revisionId, items)
  }
}

export async function updateRevisionFields(
  id: string,
  fields: Partial<Pick<RevisionRequest, 'internal_notes' | 'assignee_id' | 'due_date' | 'urgency'>>,
) {
  const now = new Date().toISOString()
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('revision_requests').update({ ...fields, updated_at: now }).eq('id', id)
    if (error) throw error
  } else {
    const revision = localGetRevision(id)
    if (revision) {
      localSaveRevision({
        revision: { ...revision, ...fields, updated_at: now },
        items: revision.items ?? [],
        attachments: revision.attachments ?? [],
      })
    }
  }
}

export async function exportRevision(revisionId: string, actorId: string | null): Promise<RevisionExport> {
  const revision = await getRevision(revisionId)
  if (!revision) throw new Error('Revision not found')

  const structured = revision.structured_payload as unknown as StructuredRevisionRequest
  const images: ReferenceImage[] = (revision.attachments ?? []).map((att) => ({
    id: att.id,
    name: att.file_name,
    mimeType: att.mime_type,
    sizeBytes: att.size_bytes,
    caption: att.caption,
    dataUrl: att.public_url ?? '',
    storagePath: att.storage_path,
    publicUrl: att.public_url ?? undefined,
  }))

  const result = exportRevisionToToon(structured, images, { useStorageUrls: true })
  validateToonStrict(result.toon)

  const exportRecord: RevisionExport = {
    id: crypto.randomUUID(),
    revision_id: revisionId,
    format: 'toon',
    file_name: result.filename,
    content: result.toon,
    storage_path: null,
    created_by: actorId,
    created_at: new Date().toISOString(),
  }

  if (isSupabaseConfigured && supabase) {
    await supabase.from('revision_exports').insert(exportRecord)
    await supabase.from('revision_requests').update({ status: 'exported', updated_at: new Date().toISOString() }).eq('id', revisionId)
    await supabase.from('revision_events').insert({
      id: crypto.randomUUID(),
      revision_id: revisionId,
      actor_id: actorId,
      event_type: 'exported',
      payload: { format: 'toon', fileName: result.filename },
      created_at: new Date().toISOString(),
    })
  } else {
    localAddExport(exportRecord)
    localUpdateRevisionStatus(revisionId, 'exported', actorId)
  }

  logAnalyticsEvent('revision_exported', { revisionId, format: 'toon' })
  return exportRecord
}

export async function addClarificationMessage(
  revisionId: string,
  message: string,
  authorName: string,
  authorId: string | null,
  isInternal: boolean,
) {
  const record: ClarificationMessage = {
    id: crypto.randomUUID(),
    revision_id: revisionId,
    author_id: authorId,
    author_name: authorName,
    is_internal: isInternal,
    message,
    created_at: new Date().toISOString(),
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('clarification_messages').insert(record)
    if (error) throw error
  } else {
    localAddMessage(record)
  }

  if (!isInternal) {
    await updateRevisionStatus(revisionId, 'needs_clarification', authorId)
  }

  return record
}

export async function createRevisionVersion(parentId: string, rawRequest: string, userId: string | null) {
  const parent = await getRevision(parentId)
  if (!parent) throw new Error('Parent revision not found')

  return submitRevision({
    projectId: parent.project_id,
    rawRequest,
    images: [],
    userId,
    clientNotes: `Amendment to revision ${parentId}`,
    urgency: parent.urgency,
  })
}

export function logRevisionEvent(
  revisionId: string,
  eventType: string,
  actorId: string | null,
  payload: Record<string, unknown>,
) {
  const event: RevisionEvent = {
    id: crypto.randomUUID(),
    revision_id: revisionId,
    actor_id: actorId,
    event_type: eventType,
    payload,
    created_at: new Date().toISOString(),
  }

  if (isSupabaseConfigured && supabase) {
    void supabase.from('revision_events').insert(event)
  } else {
    localAddEvent(event)
  }
}
