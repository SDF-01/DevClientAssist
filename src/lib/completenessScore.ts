import type { StructuredRevisionRequest } from '@/types/revision'
import type { ReferenceImage } from '@/types/revision'

export interface CompletenessResult {
  score: number
  warnings: string[]
  suggestions: string[]
}

export function calculateCompletenessScore(
  rawRequest: string,
  images: ReferenceImage[],
  structured: StructuredRevisionRequest,
): CompletenessResult {
  let score = 0
  const warnings: string[] = []
  const suggestions: string[] = []

  if (rawRequest.trim().length >= 20) score += 20
  else warnings.push('Revision description is very short.')

  if (structured.revisions.length >= 1) score += 20
  else warnings.push('No revision items could be parsed.')

  if (structured.revisions.some((r) => r.acceptanceCriteria.length > 0)) score += 15
  else suggestions.push('Add bullet points for clearer acceptance criteria.')

  const hasUiChange = structured.revisions.some((r) => r.category === 'ui' || r.category === 'ux')
  if (hasUiChange && images.length === 0) {
    warnings.push('UI/UX changes detected but no reference screenshots attached.')
    suggestions.push('Attach mockups or screenshots for visual revisions.')
  } else if (images.length > 0) {
    score += 20
  }

  if (structured.instructions.goals.length >= 1) score += 10
  if (structured.instructions.constraints.length >= 1) score += 5
  if (rawRequest.split(/\s+/).filter(Boolean).length >= 30) score += 10

  const uncaptioned = images.filter((img) => !img.caption.trim())
  if (uncaptioned.length > 0) {
    suggestions.push(`${uncaptioned.length} image(s) missing captions.`)
  } else if (images.length > 0) {
    score += 10
  }

  return {
    score: Math.min(100, score),
    warnings,
    suggestions,
  }
}
