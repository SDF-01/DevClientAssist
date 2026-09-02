import type { StructuredRevisionRequest } from '@/types/revision'
import type { RevisionRequestWithRelations } from '@/types/database'

export function buildVersionDiff(
  previous: RevisionRequestWithRelations,
  current: RevisionRequestWithRelations,
): string {
  const prevStructured = previous.structured_payload as StructuredRevisionRequest | null
  const currStructured = current.structured_payload as StructuredRevisionRequest | null

  const lines = [
    `# Revision Amendment v${current.version}`,
    '',
    `Previous: ${previous.id} (v${previous.version})`,
    `Current: ${current.id} (v${current.version})`,
    '',
    '## Raw Request Changes',
    '### Before',
    previous.raw_request,
    '',
    '### After',
    current.raw_request,
  ]

  if (prevStructured && currStructured) {
    lines.push('', '## Parsed Item Count', `- Before: ${prevStructured.revisions.length}`, `- After: ${currStructured.revisions.length}`)
  }

  return lines.join('\n')
}

export function detectSimilarRequests(
  rawRequest: string,
  existing: RevisionRequestWithRelations[],
  withinDays = 7,
): RevisionRequestWithRelations[] {
  const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000
  const normalized = rawRequest.toLowerCase().trim()
  const words = new Set(normalized.split(/\s+/).filter((w) => w.length > 3))

  return existing.filter((revision) => {
    if (new Date(revision.created_at).getTime() < cutoff) return false
    const otherWords = revision.raw_request.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    const overlap = otherWords.filter((w) => words.has(w)).length
    const similarity = overlap / Math.max(words.size, otherWords.length, 1)
    return similarity > 0.5
  })
}
