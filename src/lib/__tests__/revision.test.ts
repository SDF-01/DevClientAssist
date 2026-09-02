import { describe, expect, it } from 'vitest'
import { calculateCompletenessScore } from '@/lib/completenessScore'
import { extractPreserveClauses, rewriteClientRequest, splitWorkItems } from '@/lib/rewriteEngine'
import { structureRevisionRequest } from '@/lib/revisionParser'
import { compileLocalToon } from '@/lib/toonEngine'
import { validateToonStrict, exportRevisionToToon } from '@/lib/toonExporter'

const messy =
  'the header is kinda off and the button color doesnt match the screenshot also login is fine leave it'

describe('revisionParser', () => {
  it('parses bullet points into revision items', () => {
    const raw = '- Update header color\n- Fix login button alignment'
    const result = structureRevisionRequest('airmen-voice', raw, [])
    expect(result.revisions.length).toBeGreaterThanOrEqual(2)
  })
})

describe('rewriteEngine', () => {
  it('rewrites informal notes instead of copying them', () => {
    const rewritten = rewriteClientRequest(messy, {
      appName: 'Airmen Voice',
      appDescription: 'Voice and communication platform for airmen',
      images: [],
    })

    expect(rewritten.revisions.length).toBeGreaterThanOrEqual(2)
    expect(rewritten.constraints.join(' ').toLowerCase()).toMatch(/login/)
    for (const item of rewritten.revisions) {
      expect(item.details.toLowerCase()).not.toBe(messy.toLowerCase())
      expect(item.summary.toLowerCase()).not.toContain('kinda off')
      expect(item.details).toMatch(/Implement this in Airmen Voice/)
      expect(item.acceptanceCriteria.length).toBeGreaterThan(0)
    }
    expect(rewritten.overview).toMatch(/Rewritten agent brief/)
  })

  it('keeps preserve clauses out of the work list', () => {
    const constraints = extractPreserveClauses(messy)
    const items = splitWorkItems(messy, constraints)
    expect(items.some((item) => /login is fine/i.test(item))).toBe(false)
  })
})

describe('completenessScore', () => {
  it('scores longer requests higher', () => {
    const raw =
      '- Update the dashboard hero section to match the brand guidelines and improve readability on mobile devices'
    const structured = structureRevisionRequest('airmen-voice', raw, [])
    const score = calculateCompletenessScore(raw, [], structured)
    expect(score.score).toBeGreaterThan(30)
  })
})

describe('toonEngine', () => {
  it('compiles valid TOON from rewritten instructions', () => {
    const result = compileLocalToon({
      appId: 'airmen-voice',
      rawRequest: messy,
      images: [],
    })
    expect(result.engine).toBe('local-rewrite')
    expect(result.toon).toMatch(/Rewritten agent brief/)
    expect(result.structured.clientInput.rawRequest).toBe(messy)
    expect(() => validateToonStrict(result.toon)).not.toThrow()
  })

  it('produces valid TOON from a short request', () => {
    const raw = '- Change button color to purple'
    const structured = structureRevisionRequest('airmen-voice', raw, [])
    const result = exportRevisionToToon(structured, [])
    expect(() => validateToonStrict(result.toon)).not.toThrow()
  })
})
