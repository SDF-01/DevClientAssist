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
  else warnings.push('A little more detail will help the team picture the change.')

  if (structured.revisions.length >= 1) score += 20
  else warnings.push('We will tidy this into a brief after you send it.')

  if (structured.revisions.some((r) => r.acceptanceCriteria.length > 0)) score += 15
  else suggestions.push('Bullet points make each change easier to follow.')

  const hasUiChange = structured.revisions.some((r) => r.category === 'ui' || r.category === 'ux')
  if (hasUiChange && images.length === 0) {
    warnings.push('A screenshot would help for this visual change.')
    suggestions.push('Add a picture of the screen if you have one.')
  } else if (images.length > 0) {
    score += 20
  }

  if (structured.instructions.goals.length >= 1) score += 10
  if (structured.instructions.constraints.length >= 1) score += 5
  if (rawRequest.split(/\s+/).filter(Boolean).length >= 30) score += 10

  const uncaptioned = images.filter((img) => !img.caption.trim())
  if (uncaptioned.length > 0) {
    suggestions.push('A short caption on each picture helps the team know what to look at.')
  } else if (images.length > 0) {
    score += 10
  }

  return {
    score: Math.min(100, score),
    warnings,
    suggestions,
  }
}
