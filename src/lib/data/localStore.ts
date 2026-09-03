import type {
  ClarificationMessage,
  Project,
  RevisionAttachment,
  RevisionEvent,
  RevisionExport,
  RevisionItemRecord,
  RevisionRequest,
  RevisionRequestWithRelations,
  RevisionStatus,
  RevisionTemplate,
  UserRole,
} from '@/types/database'
import { CLIENT_APPS } from '@/data/apps'
import { resolveUserRole } from '@/lib/access'

const STORAGE_KEY = 'revision-portal-data'
const AUTH_KEY = 'revision-portal-auth'

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'

interface LocalStore {
  projects: Project[]
  revisions: RevisionRequest[]
  items: RevisionItemRecord[]
  attachments: RevisionAttachment[]
  events: RevisionEvent[]
  exports: RevisionExport[]
  messages: ClarificationMessage[]
  templates: RevisionTemplate[]
}

function loadStore(): LocalStore {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    return JSON.parse(raw) as LocalStore
  }

  const projects: Project[] = CLIENT_APPS.map((app, index) => ({
    id: `local-project-${index + 1}`,
    organization_id: DEFAULT_ORG_ID,
    name: app.name,
    slug: app.id,
    description: app.description,
    github_repo: null,
    default_branch: 'main',
    is_active: true,
    created_at: new Date().toISOString(),
  }))

  const templates: RevisionTemplate[] = [
    {
      id: 'tpl-1',
      name: 'Homepage Hero Update',
      description: 'Update hero section layout, copy, or imagery',
      template_text:
        '- Update the homepage hero section\n- Match attached reference screenshot\n- Keep existing navigation unchanged',
      category: 'ui',
    },
    {
      id: 'tpl-2',
      name: 'Bug Fix Report',
      description: 'Report a broken feature or error',
      template_text:
        '- Describe the bug and steps to reproduce\n- Expected vs actual behavior\n- Priority: high',
      category: 'functionality',
    },
    {
      id: 'tpl-3',
      name: 'Copy Change',
      description: 'Update text, labels, or messaging',
      template_text: '- Update the following copy:\n- Keep tone consistent with brand guidelines',
      category: 'content',
    },
  ]

  return { projects, revisions: [], items: [], attachments: [], events: [], exports: [], messages: [], templates }
}

function saveStore(store: LocalStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export interface LocalUser {
  id: string
  email: string
  full_name: string
  role: UserRole
  organization_id: string
}

export function getLocalUser(): LocalUser | null {
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return null
  const user = JSON.parse(raw) as LocalUser
  return {
    ...user,
    role: resolveUserRole(user.email, user.role),
  }
}

export function setLocalUser(user: LocalUser | null) {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function localListProjects(): Project[] {
  return loadStore().projects.filter((p) => p.is_active)
}

export function localGetProject(id: string): Project | undefined {
  return loadStore().projects.find((p) => p.id === id || p.slug === id)
}

export function localListRevisions(filters?: { status?: RevisionStatus; role?: UserRole }): RevisionRequestWithRelations[] {
  const store = loadStore()
  let revisions = [...store.revisions]

  if (filters?.status) {
    revisions = revisions.filter((r) => r.status === filters.status)
  }

  revisions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return revisions.map((revision) => ({
    ...revision,
    project: store.projects.find((p) => p.id === revision.project_id),
    items: store.items.filter((i) => i.revision_id === revision.id).sort((a, b) => a.order_index - b.order_index),
    attachments: store.attachments.filter((a) => a.revision_id === revision.id),
    events: store.events.filter((e) => e.revision_id === revision.id),
    messages: store.messages.filter((m) => m.revision_id === revision.id),
  }))
}

export function localGetRevision(id: string): RevisionRequestWithRelations | null {
  return localListRevisions().find((r) => r.id === id) ?? null
}

export function localSaveRevision(data: {
  revision: RevisionRequest
  items: RevisionItemRecord[]
  attachments: RevisionAttachment[]
  event?: RevisionEvent
}): RevisionRequestWithRelations {
  const store = loadStore()
  const existingIndex = store.revisions.findIndex((r) => r.id === data.revision.id)

  if (existingIndex >= 0) {
    store.revisions[existingIndex] = data.revision
    store.items = store.items.filter((i) => i.revision_id !== data.revision.id).concat(data.items)
    store.attachments = store.attachments.filter((a) => a.revision_id !== data.revision.id).concat(data.attachments)
  } else {
    store.revisions.push(data.revision)
    store.items.push(...data.items)
    store.attachments.push(...data.attachments)
  }

  if (data.event) {
    store.events.push(data.event)
  }

  saveStore(store)
  return localGetRevision(data.revision.id)!
}

export function localAddEvent(event: RevisionEvent) {
  const store = loadStore()
  store.events.push(event)
  saveStore(store)
}

export function localAddMessage(message: ClarificationMessage) {
  const store = loadStore()
  store.messages.push(message)
  saveStore(store)
}

export function localAddExport(exportRecord: RevisionExport) {
  const store = loadStore()
  store.exports.push(exportRecord)
  saveStore(store)
}

export function localListTemplates(): RevisionTemplate[] {
  return loadStore().templates
}

export function localUpdateRevisionStatus(id: string, status: RevisionStatus, actorId: string | null) {
  const store = loadStore()
  const revision = store.revisions.find((r) => r.id === id)
  if (!revision) return null

  revision.status = status
  revision.updated_at = new Date().toISOString()

  store.events.push({
    id: crypto.randomUUID(),
    revision_id: id,
    actor_id: actorId,
    event_type: 'status_changed',
    payload: { from: revision.status, to: status },
    created_at: new Date().toISOString(),
  })

  saveStore(store)
  return localGetRevision(id)
}

export function localUpdateRevisionItems(revisionId: string, items: RevisionItemRecord[]) {
  const store = loadStore()
  store.items = store.items.filter((i) => i.revision_id !== revisionId).concat(items)
  saveStore(store)
}

export function localPurgeOldRevisions(retentionDays: number) {
  const store = loadStore()
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000
  const oldIds = store.revisions
    .filter((r) => r.status === 'done' && new Date(r.updated_at).getTime() < cutoff)
    .map((r) => r.id)

  store.revisions = store.revisions.filter((r) => !oldIds.includes(r.id))
  store.items = store.items.filter((i) => !oldIds.includes(i.revision_id))
  store.attachments = store.attachments.filter((a) => !oldIds.includes(a.revision_id))
  store.events = store.events.filter((e) => !oldIds.includes(e.revision_id))
  saveStore(store)
  return oldIds.length
}
