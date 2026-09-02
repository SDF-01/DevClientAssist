import { decode, encode } from '@toon-format/toon'
import type { ReferenceImage, StructuredRevisionRequest } from '../types/revision'

export interface ToonExportResult {
  toon: string
  filename: string
  structured: StructuredRevisionRequest
}

export interface ExportOptions {
  useStorageUrls?: boolean
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildExportPayload(
  structured: StructuredRevisionRequest,
  images: ReferenceImage[],
  options?: ExportOptions,
): Record<string, unknown> {
  return {
    meta: structured.meta,
    target: structured.target,
    clientInput: structured.clientInput,
    instructions: structured.instructions,
    revisions: structured.revisions.map((revision) => ({
      id: revision.id,
      order: revision.order,
      category: revision.category,
      priority: revision.priority,
      summary: revision.summary,
      details: revision.details,
      acceptanceCriteria: revision.acceptanceCriteria,
    })),
    references: images.map((image) => ({
      id: image.id,
      name: image.name,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      caption: image.caption || `Reference image: ${image.name}`,
      ...(options?.useStorageUrls && image.storagePath
        ? { storagePath: image.storagePath, publicUrl: image.publicUrl ?? null, hasImageData: false }
        : { dataUrl: image.dataUrl, hasImageData: Boolean(image.dataUrl) }),
    })),
    agentGuidance: structured.agentGuidance,
  }
}

export function exportRevisionToToon(
  structured: StructuredRevisionRequest,
  images: ReferenceImage[],
  options?: ExportOptions,
): ToonExportResult {
  const payload = buildExportPayload(structured, images, options)
  const toon = encode(payload)

  const dateStamp = structured.meta.createdAt.slice(0, 10)
  const filename = `${slugify(structured.target.appName)}-revision-${dateStamp}.toon`

  return {
    toon,
    filename,
    structured,
  }
}

export function validateToonStrict(toon: string): void {
  try {
    decode(toon, { strict: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid TOON output'
    throw new Error(`TOON validation failed: ${message}`)
  }
}

export function exportToMarkdown(structured: StructuredRevisionRequest): string {
  const lines = [
    `# ${structured.instructions.title}`,
    '',
    structured.instructions.overview,
    '',
    '## Goals',
    ...structured.instructions.goals.map((g) => `- ${g}`),
    '',
    '## Revisions',
    ...structured.revisions.flatMap((r) => [
      `### ${r.order}. ${r.summary}`,
      `- Category: ${r.category}`,
      `- Priority: ${r.priority}`,
      `- ${r.details}`,
    ]),
  ]
  return lines.join('\n')
}

export function exportToJson(structured: StructuredRevisionRequest): string {
  return JSON.stringify(structured, null, 2)
}

export function downloadToonFile(toon: string, filename: string): void {
  const blob = new Blob([toon], { type: 'text/toon;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadTextFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
