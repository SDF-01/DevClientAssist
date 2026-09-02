import type {
  ReferenceImage,
  RevisionCategory,
  RevisionItem,
  RevisionPriority,
} from '@/types/revision'

export interface RewriteContext {
  appName: string
  appDescription: string
  urgency?: RevisionPriority
  clientNotes?: string
  images: ReferenceImage[]
}

export interface RewrittenBrief {
  title: string
  overview: string
  goals: string[]
  constraints: string[]
  outOfScope: string[]
  revisions: RevisionItem[]
  executionOrder: string[]
  verificationSteps: string[]
  notesForDeveloper: string[]
  engine: 'local-rewrite'
}

const UI_TARGETS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\b(primary |cta )?buttons?\b/i, label: 'primary button' },
  { pattern: /\bheader|nav(?:igation)?|top bar\b/i, label: 'header' },
  { pattern: /\bfooter\b/i, label: 'footer' },
  { pattern: /\bsidebar\b/i, label: 'sidebar' },
  { pattern: /\blogin|sign[- ]?in\b/i, label: 'login' },
  { pattern: /\bsearch\b/i, label: 'search' },
  { pattern: /\bhero|banner\b/i, label: 'hero' },
  { pattern: /\bdashboard\b/i, label: 'dashboard' },
  { pattern: /\bmodal|dialog|popup\b/i, label: 'dialog' },
  { pattern: /\bform\b/i, label: 'form' },
  { pattern: /\bicon\b/i, label: 'icon' },
  { pattern: /\bcolor|palette|theme\b/i, label: 'color treatment' },
  { pattern: /\bfont|type|typography\b/i, label: 'typography' },
  { pattern: /\blayout|spacing|padding|margin\b/i, label: 'layout' },
  { pattern: /\bcopy|wording|label|title|text\b/i, label: 'copy' },
]

const PRESERVE_PATTERN =
  /(?:leave|keep|do not (?:change|touch|edit|update)|don't (?:change|touch|edit)|dont (?:change|touch|edit)|without (?:changing|touching)|is fine)\s+(.+?)(?=[.!,\n]|$)/gi

const PRIORITY_RANK: Record<RevisionPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function stripCourtesy(text: string): string {
  return normalizeWhitespace(
    text
      .replace(/^(?:please|pls|can you|could you|would you|i want(?: you)? to|we need to|need to)\s+/i, '')
      .replace(/\b(?:thanks|thank you|thx)\.?$/i, ''),
  )
}

function unique(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const key = value.toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(value)
  }
  return result
}

export function extractPreserveClauses(text: string): string[] {
  const matches: string[] = []
  const pattern = new RegExp(PRESERVE_PATTERN.source, 'gi')
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const clause = stripCourtesy(match[1] ?? '')
      .replace(/^(?:the|it|this)\s+/i, '')
      .replace(/\s+as (?:it is|is|they are)$/i, '')
    if (clause) matches.push(`Do not change ${clause}.`)
  }

  if (/\blogin is fine\b/i.test(text) && !matches.some((item) => /login/i.test(item))) {
    matches.push('Do not change login.')
  }

  return unique(matches)
}

function hasUiSignal(text: string): boolean {
  return UI_TARGETS.some((target) => target.pattern.test(text))
}

function splitCoordinated(text: string): string[] {
  const parts = text.split(/\s+(?:also|plus|additionally|besides(?: that)?|and then)\s+/i)
  const expanded: string[] = []

  for (const part of parts) {
    const andParts = part.split(/\s+and\s+/i)
    if (andParts.length > 1 && andParts.every((piece) => hasUiSignal(piece) || /\b(move|fix|change|match|update|slow|off|weird)\b/i.test(piece))) {
      expanded.push(...andParts)
    } else {
      expanded.push(part)
    }
  }

  return expanded.map(stripCourtesy).filter(Boolean)
}

export function splitWorkItems(rawRequest: string, constraints: string[]): string[] {
  const lines = rawRequest
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, ''))
    .map(stripCourtesy)
    .filter(Boolean)

  const source = lines.length >= 2 ? lines : splitCoordinated(stripCourtesy(rawRequest.replace(/^[-*•]\s+/, '')))

  const filtered = source.filter((item) => {
    if (constraints.some((constraint) => item.toLowerCase().includes(constraint.toLowerCase().replace(/^do not change\s+/i, '').replace(/\.$/, '')))) {
      if (/^(?:leave|keep|do not|don't|dont|login is fine)/i.test(item)) return false
    }
    return item.length > 2
  })

  return filtered.length > 0 ? unique(filtered) : [stripCourtesy(rawRequest)]
}

function detectTarget(text: string): string {
  for (const target of UI_TARGETS) {
    if (target.pattern.test(text)) return target.label
  }
  return 'requested element'
}

function detectCategory(text: string): RevisionCategory {
  const lower = text.toLowerCase()
  if (/\b(slow|lag|load|performance|optimize)\b/.test(lower)) return 'performance'
  if (/\b(screen reader|contrast|keyboard|aria|wcag|focus)\b/.test(lower)) return 'accessibility'
  if (/\b(copy|wording|label|title|text|typo|message)\b/.test(lower)) return 'content'
  if (/\b(flow|confus|onboarding|journey|too many clicks|hard to find)\b/.test(lower)) return 'ux'
  if (/\b(broken|bug|error|doesn't work|doesnt work|fail|save|submit|search|filter)\b/.test(lower)) return 'functionality'
  if (/\b(color|font|layout|button|header|spacing|visual|theme|icon|hero)\b/.test(lower)) return 'ui'
  return 'ui'
}

function detectPriority(text: string, urgency?: RevisionPriority): RevisionPriority {
  const lower = text.toLowerCase()
  if (/\b(critical|blocker|urgent|asap|immediately)\b/.test(lower)) return 'critical'
  if (/\b(high priority|important|must)\b/.test(lower)) return 'high'
  if (/\b(low priority|minor|optional|eventually)\b/.test(lower)) return 'low'
  if (urgency === 'critical' || urgency === 'high') return urgency
  return urgency ?? 'medium'
}

function toImperative(text: string, target: string): string {
  const lower = text.toLowerCase()

  if (/\b(too low|move(?: it)? up|higher|raise)\b/.test(lower)) {
    return `Raise the ${target} so it sits in a clearer visual hierarchy.`
  }
  if (/\b(too high|move(?: it)? down|lower)\b/.test(lower)) {
    return `Lower the ${target} so spacing matches the surrounding layout.`
  }
  if (/\b(match|doesn'?t match|doesnt match|same as the screenshot)\b/.test(lower)) {
    return `Match the ${target} to the visual reference. Use attached screenshots as the source of truth for color, size, and placement.`
  }
  if (/\b(color|hex|palette)\b/.test(lower)) {
    return `Update the ${target} color so it is consistent with the brand and any attached reference.`
  }
  if (/\b(slow|lag|loading)\b/.test(lower)) {
    return `Improve response time for ${target}, especially on mobile.`
  }
  if (/\b(confus|hard to|unintuitive|too many clicks)\b/.test(lower)) {
    return `Simplify the ${target} interaction so the next step is obvious.`
  }
  if (/\b(broken|doesn't work|doesnt work|error|bug)\b/.test(lower)) {
    return `Repair ${target} so the expected action completes without error.`
  }
  if (/\b(off|weird|kinda|kind of|doesn'?t look right)\b/.test(lower)) {
    return `Correct the visual treatment of the ${target} so alignment, spacing, and contrast look intentional.`
  }
  if (/\b(add|new)\b/.test(lower)) {
    return `Add the requested ${target} without disturbing unrelated layout.`
  }
  if (/\b(remove|hide|delete)\b/.test(lower)) {
    return `Remove the ${target} and close any leftover empty space.`
  }

  return `Apply the requested change to the ${target} with a precise, production-ready implementation.`
}

function rewriteSummary(imperative: string): string {
  return imperative.replace(/\.$/, '').slice(0, 120)
}

function imageGuidance(images: ReferenceImage[]): string {
  if (images.length === 0) return 'No screenshot was attached. Infer layout only from this brief; ask before inventing visuals.'
  const captions = images
    .map((image) => image.caption.trim() || image.name)
    .slice(0, 4)
    .join('; ')
  return `Use ${images.length} attached screenshot${images.length === 1 ? '' : 's'} as visual ground truth (${captions}).`
}

function rewriteItem(
  chunk: string,
  order: number,
  context: RewriteContext,
  constraints: string[],
): RevisionItem {
  const target = detectTarget(chunk)
  const category = detectCategory(chunk)
  const priority = detectPriority(chunk, context.urgency)
  const imperative = toImperative(chunk, target)
  const preserve = constraints.length > 0 ? constraints.join(' ') : 'Do not change unrelated screens, copy, or flows.'

  const details = [
    `Implement this in ${context.appName}.`,
    `Requested outcome: ${imperative}`,
    `Scope: ${target}. Category: ${category}.`,
    `Preserve: ${preserve}`,
    imageGuidance(context.images),
    context.clientNotes?.trim() ? `Extra client note: ${normalizeWhitespace(context.clientNotes)}` : null,
    `Original wording (context only): ${stripCourtesy(chunk)}`,
  ]
    .filter(Boolean)
    .join(' ')

  const acceptanceCriteria = unique([
    imperative.replace(/\.$/, '') + '.',
    preserve,
    context.images.length > 0 ? 'Visual result matches the attached screenshot for this change.' : 'The change is visible on the named screen without regressions.',
  ])

  return {
    id: createId('rev'),
    order,
    category,
    priority,
    summary: rewriteSummary(imperative),
    details,
    acceptanceCriteria,
  }
}

export function rewriteClientRequest(rawRequest: string, context: RewriteContext): RewrittenBrief {
  const cleaned = rawRequest.trim()
  const constraints = [
    ...extractPreserveClauses(cleaned),
    ...extractPreserveClauses(context.clientNotes ?? ''),
  ]
  const chunks = splitWorkItems(cleaned, constraints)
  const revisions = chunks.map((chunk, index) => rewriteItem(chunk, index + 1, context, constraints))

  const goals = unique(revisions.map((item) => item.summary)).slice(0, 8)
  const title = `${context.appName}: ${revisions[0]?.summary ?? 'revision brief'}`
  const overview = `Rewritten agent brief for ${context.appName} (${context.appDescription}). ${revisions.length} change${revisions.length === 1 ? '' : 's'} compiled from informal notes. Follow the rewritten items. Treat the original wording as context only.`

  const sorted = [...revisions].sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.order - b.order,
  )

  return {
    title: title.length > 140 ? `${title.slice(0, 137)}...` : title,
    overview,
    goals,
    constraints,
    outOfScope: constraints.map((item) => item.replace(/^Do not change /i, '').replace(/\.$/, '')),
    revisions,
    executionOrder: sorted.map((item) => `${item.order}. [${item.priority}/${item.category}] ${item.summary}`),
    verificationSteps: [
      `Confirm the target application is ${context.appName}.`,
      ...revisions.map((item) => `Check item ${item.order}: ${item.acceptanceCriteria[0]}`),
      'Run a quick regression pass on untouched flows named in constraints.',
    ],
    notesForDeveloper: [
      'This brief was rewritten by the Dev Generator TOON engine. Implement the rewritten items, not the raw client wording.',
      'Preserve existing design tokens and component patterns unless a rewritten item explicitly replaces them.',
      imageGuidance(context.images),
    ],
    engine: 'local-rewrite',
  }
}
