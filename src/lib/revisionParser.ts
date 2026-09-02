import type {
  ReferenceImage,
  RevisionCategory,
  RevisionItem,
  RevisionPriority,
  StructuredRevisionRequest,
} from '../types/revision'
import { getAppById } from '../data/apps'

const CATEGORY_KEYWORDS: Record<RevisionCategory, string[]> = {
  ui: ['color', 'font', 'layout', 'spacing', 'button', 'header', 'footer', 'sidebar', 'icon', 'visual', 'style', 'theme', 'dark mode', 'light mode'],
  ux: ['flow', 'navigation', 'user experience', 'confusing', 'intuitive', 'onboarding', 'journey', 'click', 'steps', 'workflow'],
  content: ['text', 'copy', 'wording', 'label', 'title', 'description', 'content', 'message', 'translation'],
  functionality: ['feature', 'function', 'work', 'broken', 'bug', 'error', 'logic', 'calculate', 'filter', 'search', 'save', 'submit'],
  performance: ['slow', 'loading', 'speed', 'performance', 'lag', 'optimize', 'cache'],
  accessibility: ['accessibility', 'screen reader', 'contrast', 'keyboard', 'aria', 'wcag', 'focus'],
  other: [],
}

const PRIORITY_KEYWORDS: Record<RevisionPriority, string[]> = {
  critical: ['critical', 'urgent', 'blocker', 'asap', 'immediately', 'production down'],
  high: ['high priority', 'important', 'must have', 'needed soon'],
  medium: ['medium', 'when possible', 'nice to have'],
  low: ['low priority', 'minor', 'eventually', 'optional'],
}

const GOAL_PATTERNS = [
  /(?:goal|objective|aim|want to|need to|should)\s*[:\-]?\s*(.+)/i,
  /(?:please|can you|could you)\s+(.+)/i,
]

const CONSTRAINT_PATTERNS = [
  /(?:must not|don't|do not|avoid|without|keep)\s+(.+)/i,
  /(?:constraint|limitation|requirement)\s*[:\-]?\s*(.+)/i,
]

const OUT_OF_SCOPE_PATTERNS = [
  /(?:out of scope|not in scope|exclude|skip)\s*[:\-]?\s*(.+)/i,
]

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function normalizeWhitespace(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .trim()
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => normalizeWhitespace(part))
    .filter((part) => part.length > 0)
}

function splitIntoBullets(text: string): string[] {
  const lines = text.split(/\n+/)
  const bullets: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/)
    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)/)

    if (bulletMatch) {
      bullets.push(normalizeWhitespace(bulletMatch[1]))
    } else if (numberedMatch) {
      bullets.push(normalizeWhitespace(numberedMatch[1]))
    }
  }

  return bullets
}

function detectCategory(text: string): RevisionCategory {
  const lower = text.toLowerCase()
  let bestCategory: RevisionCategory = 'other'
  let bestScore = 0

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as Array<[RevisionCategory, string[]]>) {
    if (category === 'other') continue
    const score = keywords.reduce((total, keyword) => (lower.includes(keyword) ? total + 1 : total), 0)
    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }

  return bestCategory
}

function detectPriority(text: string): RevisionPriority {
  const lower = text.toLowerCase()

  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS) as Array<[RevisionPriority, string[]]>) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return priority
    }
  }

  return 'medium'
}

function extractPatternMatches(text: string, patterns: RegExp[]): string[] {
  const matches: string[] = []

  for (const sentence of splitIntoSentences(text)) {
    for (const pattern of patterns) {
      const match = sentence.match(pattern)
      if (match?.[1]) {
        matches.push(normalizeWhitespace(match[1]))
      }
    }
  }

  return [...new Set(matches)]
}

function buildSummary(text: string): string {
  const firstSentence = splitIntoSentences(text)[0]
  if (!firstSentence) return 'Revision request'
  return firstSentence.length > 120 ? `${firstSentence.slice(0, 117)}...` : firstSentence
}

function buildAcceptanceCriteria(text: string): string[] {
  const bullets = splitIntoBullets(text)
  if (bullets.length > 0) {
    return bullets.map((bullet) => `Verify: ${bullet}`)
  }

  const sentences = splitIntoSentences(text)
  if (sentences.length <= 1) {
    return [`Verify the requested change is implemented as described: ${buildSummary(text)}`]
  }

  return sentences.slice(0, 4).map((sentence) => `Verify: ${sentence}`)
}

function chunkIntoRevisionItems(rawRequest: string): string[] {
  const bulletChunks = splitIntoBullets(rawRequest)
  if (bulletChunks.length >= 2) {
    return bulletChunks
  }

  const paragraphChunks = rawRequest
    .split(/\n\s*\n+/)
    .map((chunk) => normalizeWhitespace(chunk))
    .filter((chunk) => chunk.length > 0)

  if (paragraphChunks.length >= 2) {
    return paragraphChunks
  }

  const sentences = splitIntoSentences(rawRequest)
  if (sentences.length >= 3) {
    return sentences
  }

  return [normalizeWhitespace(rawRequest)]
}

function buildRevisionItems(rawRequest: string): RevisionItem[] {
  const chunks = chunkIntoRevisionItems(rawRequest)

  return chunks.map((chunk, index) => ({
    id: createId('rev'),
    order: index + 1,
    category: detectCategory(chunk),
    priority: detectPriority(chunk),
    summary: buildSummary(chunk),
    details: chunk,
    acceptanceCriteria: buildAcceptanceCriteria(chunk),
  }))
}

function buildOverview(rawRequest: string, revisionCount: number): string {
  const summary = buildSummary(rawRequest)
  return `Client submitted ${revisionCount} revision item${revisionCount === 1 ? '' : 's'} for the selected application. Primary request: ${summary}`
}

function buildGoals(rawRequest: string, revisions: RevisionItem[]): string[] {
  const explicitGoals = extractPatternMatches(rawRequest, GOAL_PATTERNS)
  const revisionSummaries = revisions.map((item) => item.summary)

  const combined = [...explicitGoals, ...revisionSummaries]
  return combined.length > 0 ? [...new Set(combined)].slice(0, 8) : ['Implement the client-requested revisions accurately']
}

function buildExecutionOrder(revisions: RevisionItem[]): string[] {
  const sorted = [...revisions].sort((a, b) => {
    const priorityRank: Record<RevisionPriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    }
    return priorityRank[a.priority] - priorityRank[b.priority] || a.order - b.order
  })

  return sorted.map((item) => `${item.order}. [${item.priority}/${item.category}] ${item.summary}`)
}

function buildVerificationSteps(revisions: RevisionItem[]): string[] {
  const steps = [
    'Confirm the target application matches the selected project in the revision request.',
    'Review all attached reference images before implementing visual changes.',
  ]

  for (const revision of revisions) {
    steps.push(`Validate revision ${revision.order}: ${revision.acceptanceCriteria[0]}`)
  }

  steps.push('Run applicable UI, accessibility, and regression checks before marking complete.')

  return steps
}

function buildDeveloperNotes(revisions: RevisionItem[], imageCount: number): string[] {
  const notes = [
    'Preserve existing design system tokens and component patterns unless the client explicitly requests otherwise.',
    'Do not expand scope beyond the structured revision items unless the client confirms additional work.',
  ]

  if (imageCount > 0) {
    notes.push(`Use ${imageCount} attached reference image${imageCount === 1 ? '' : 's'} as visual guidance for layout, color, and content placement.`)
  }

  const categories = [...new Set(revisions.map((item) => item.category))]
  notes.push(`Affected areas: ${categories.join(', ')}.`)

  return notes
}

export function structureRevisionRequest(
  appId: string,
  rawRequest: string,
  images: ReferenceImage[],
): StructuredRevisionRequest {
  const app = getAppById(appId)
  if (!app) {
    throw new Error('Selected application was not found.')
  }

  const cleanedRequest = normalizeWhitespace(rawRequest)
  if (!cleanedRequest) {
    throw new Error('Revision request text is required.')
  }

  const revisions = buildRevisionItems(cleanedRequest)
  const wordCount = cleanedRequest.split(/\s+/).filter(Boolean).length

  return {
    meta: {
      id: createId('request'),
      createdAt: new Date().toISOString(),
      source: 'client-revision-portal',
      version: '1.0',
    },
    target: {
      appId: app.id,
      appName: app.name,
      appDescription: app.description,
    },
    clientInput: {
      rawRequest: cleanedRequest,
      wordCount,
    },
    instructions: {
      title: `Revision request for ${app.name}`,
      overview: buildOverview(cleanedRequest, revisions.length),
      goals: buildGoals(cleanedRequest, revisions),
      constraints: extractPatternMatches(cleanedRequest, CONSTRAINT_PATTERNS),
      outOfScope: extractPatternMatches(cleanedRequest, OUT_OF_SCOPE_PATTERNS),
    },
    revisions,
    references: images.map((image) => ({
      id: image.id,
      name: image.name,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      caption: image.caption || `Reference image: ${image.name}`,
      hasImageData: Boolean(image.dataUrl),
    })),
    agentGuidance: {
      executionOrder: buildExecutionOrder(revisions),
      verificationSteps: buildVerificationSteps(revisions),
      notesForDeveloper: buildDeveloperNotes(revisions, images.length),
    },
  }
}

export function formatStructuredPreview(request: StructuredRevisionRequest): string {
  const lines: string[] = [
    `# ${request.instructions.title}`,
    '',
    '## Overview',
    request.instructions.overview,
    '',
    '## Goals',
    ...request.instructions.goals.map((goal) => `- ${goal}`),
    '',
    '## Revision Items',
  ]

  for (const revision of request.revisions) {
    lines.push(
      '',
      `### ${revision.order}. ${revision.summary}`,
      `- Category: ${revision.category}`,
      `- Priority: ${revision.priority}`,
      `- Details: ${revision.details}`,
      '- Acceptance criteria:',
      ...revision.acceptanceCriteria.map((criterion) => `  - ${criterion}`),
    )
  }

  if (request.references.length > 0) {
    lines.push('', '## Reference Images')
    for (const reference of request.references) {
      lines.push(`- ${reference.name}: ${reference.caption}`)
    }
  }

  lines.push('', '## Developer Notes', ...request.agentGuidance.notesForDeveloper.map((note) => `- ${note}`))

  return lines.join('\n')
}
