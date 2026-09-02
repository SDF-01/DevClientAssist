import { describe, expect, it } from 'vitest'
import { calculateCompletenessScore } from '@/lib/completenessScore'
import { structureRevisionRequest } from '@/lib/revisionParser'
import { validateToonStrict, exportRevisionToToon } from '@/lib/toonExporter'

describe('revisionParser', () => {
  it('parses bullet points into revision items', () => {
    const raw = '- Update header color\n- Fix login button alignment'
    const result = structureRevisionRequest('airmen-voice', raw, [])
    expect(result.revisions.length).toBeGreaterThanOrEqual(2)
  })
})

describe('completenessScore', () => {
  it('scores longer requests higher', () => {
    const raw = '- Update the dashboard hero section to match the brand guidelines and improve readability on mobile devices'
    const structured = structureRevisionRequest('airmen-voice', raw, [])
    const score = calculateCompletenessScore(raw, [], structured)
    expect(score.score).toBeGreaterThan(30)
  })
})

describe('toonExporter', () => {
  it('produces valid TOON', () => {
    const raw = '- Change button color to purple'
    const structured = structureRevisionRequest('airmen-voice', raw, [])
    const result = exportRevisionToToon(structured, [])
    expect(() => validateToonStrict(result.toon)).not.toThrow()
  })
})
