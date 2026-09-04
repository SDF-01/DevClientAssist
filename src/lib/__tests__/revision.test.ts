import { describe, expect, it } from 'vitest'
import { calculateCompletenessScore } from '@/lib/completenessScore'
import {
  buildChatGptRevisionPrompt,
  isAcceptableToonFile,
  isLikelyToonContent,
  normalizePastedToon,
  toonFilenameForApp,
  wrapChatGptBrief,
} from '@/lib/chatgptBrief'
import { submitErrorMessage } from '@/lib/data/revisions'
import { extractPreserveClauses, rewriteClientRequest, splitWorkItems } from '@/lib/rewriteEngine'
import { structureRevisionRequest } from '@/lib/revisionParser'
import { compileLocalToon } from '@/lib/toonEngine'
import { validateToonStrict, exportRevisionToToon } from '@/lib/toonExporter'

const messy =
  'the header is kinda off and the button color doesnt match the screenshot also login is fine leave it'

describe('chatgptBrief', () => {
  it('embeds the client notes in a copyable ChatGPT prompt', () => {
    const prompt = buildChatGptRevisionPrompt({
      appName: 'Airmen Voice',
      appDescription: 'Voice and communication platform for airmen',
      rawRequest: messy,
      urgency: 'high',
    })
    expect(prompt).toContain(messy)
    expect(prompt).toContain('.toon')
    expect(prompt).toContain('Create a downloadable .toon file')
    expect(prompt).toContain('Token-Oriented Object Notation')
    expect(prompt).toContain(toonFilenameForApp('Airmen Voice'))
    expect(prompt).toContain('Airmen Voice')
    expect(prompt).not.toContain('Reply with a developer brief that uses this structure')
  })

  it('strips ChatGPT fences from a pasted .toon file', () => {
    const toon = 'instructions:\n  title: Fix header alignment'
    expect(normalizePastedToon('```toon\n' + toon + '\n```')).toBe(toon)
  })

  it('accepts ChatGPT downloads that Windows labels as plain text or unknown types', () => {
    expect(isAcceptableToonFile({ name: 'airmen-voice-revision-2026-09-04.toon', type: '' })).toBe(true)
    expect(isAcceptableToonFile({ name: 'brief.txt', type: 'text/plain' })).toBe(true)
    expect(isAcceptableToonFile({ name: 'download', type: 'application/octet-stream' })).toBe(true)
    expect(isAcceptableToonFile({ name: 'photo.png', type: 'image/png' })).toBe(false)
    expect(isLikelyToonContent('instructions:\n  title: Fix header alignment')).toBe(true)
    expect(isLikelyToonContent('hello')).toBe(false)
  })

  it('maps storage upload failures to a clear send error', () => {
    expect(submitErrorMessage({ message: 'Cannot upload' })).toMatch(/screenshot/i)
    expect(submitErrorMessage(new Error('Bucket not found'))).toMatch(/screenshot/i)
    expect(submitErrorMessage(new Error('new row violates row-level security policy'))).toMatch(/sign in/i)
  })

  it('stores the pasted ChatGPT .toon file for the developer', () => {
    const formatted = [
      'instructions:',
      '  title: Fix header alignment',
      '  overview: Raise the header so it matches the screenshot.',
    ].join('\n')
    const wrapped = wrapChatGptBrief({
      appId: 'airmen-voice',
      appName: 'Airmen Voice',
      appDescription: 'Voice and communication platform for airmen',
      rawRequest: messy,
      formattedBrief: '```toon\n' + formatted + '\n```',
      images: [],
    })
    expect(wrapped.meta.engine).toBe('chatgpt-paste')
    expect(wrapped.instructions.title).toBe('Fix header alignment')
    expect(wrapped.instructions.overview).toBe(formatted)
    expect(wrapped.clientInput.rawRequest).toBe(messy)
  })
})

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
