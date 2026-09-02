import type { ReferenceImage, RevisionPriority, StructuredRevisionRequest } from '@/types/revision'
import { calculateCompletenessScore, type CompletenessResult } from '@/lib/completenessScore'
import { formatStructuredPreview, structureRevisionRequest } from '@/lib/revisionParser'
import { exportRevisionToToon, validateToonStrict } from '@/lib/toonExporter'

export interface ToonEngineResult {
  structured: StructuredRevisionRequest
  formatted: string
  toon: string
  completeness: CompletenessResult
  engine: 'local-rewrite' | 'llm-rewrite'
}

export interface CompileToonInput {
  appId: string
  rawRequest: string
  images: ReferenceImage[]
  urgency?: RevisionPriority
  clientNotes?: string
}

export function compileLocalToon(input: CompileToonInput): ToonEngineResult {
  const structured = structureRevisionRequest(input.appId, input.rawRequest, input.images, {
    urgency: input.urgency,
    clientNotes: input.clientNotes,
  })
  const exported = exportRevisionToToon(structured, input.images)
  validateToonStrict(exported.toon)

  return {
    structured,
    formatted: formatStructuredPreview(structured),
    toon: exported.toon,
    completeness: calculateCompletenessScore(input.rawRequest, input.images, structured),
    engine: structured.meta.engine === 'llm-rewrite' ? 'llm-rewrite' : 'local-rewrite',
  }
}
