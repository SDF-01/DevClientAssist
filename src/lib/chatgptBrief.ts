import type { ReferenceImage, RevisionPriority, StructuredRevisionRequest } from '@/types/revision'

export interface ChatGptPromptInput {
  appName: string
  appDescription: string
  rawRequest: string
  urgency?: string
  clientNotes?: string
  screenshotNames?: string[]
}

export function buildChatGptRevisionPrompt(input: ChatGptPromptInput): string {
  const extra = input.clientNotes?.trim() || 'None.'
  const screenshots =
    input.screenshotNames && input.screenshotNames.length > 0
      ? input.screenshotNames.join(', ')
      : 'None listed yet. Screenshots may be added in the revision portal.'

  return [
    'I need you to rewrite my product revision notes into a clear brief for a software developer.',
    '',
    `App: ${input.appName}`,
    `What the app is: ${input.appDescription}`,
    `Urgency: ${input.urgency ?? 'medium'}`,
    `Screenshots: ${screenshots}`,
    '',
    'My notes (rewrite these into a developer brief. Do not add work I did not ask for):',
    '---',
    input.rawRequest.trim(),
    '---',
    '',
    `Extra notes from me: ${extra}`,
    '',
    'Reply with a developer brief that uses this structure:',
    '',
    'Title',
    'A short name for the request.',
    '',
    'What to change',
    'Numbered tasks. Each task should be an instruction a developer can follow. Say what to change and what the finished result should look like.',
    '',
    'What to leave alone',
    'Anything I said to keep as it is.',
    '',
    'Done when',
    'A short checklist the developer can use to know the work is finished.',
    '',
    'Rules: Do not invent extra features. Do not include code unless I asked for it. Keep the language plain.',
  ].join('\n')
}

function titleFromFormatted(formatted: string, appName: string): string {
  const heading = formatted.match(/^#\s+(.+)$/m) ?? formatted.match(/^Title[:\s]+(.+)$/im)
  if (heading?.[1]) {
    return heading[1].trim().slice(0, 140)
  }
  const firstLine = formatted
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !/^title$/i.test(line))
  if (firstLine) {
    return `${appName}: ${firstLine.slice(0, 80)}`
  }
  return `${appName} revision`
}

export function wrapChatGptBrief(input: {
  appId: string
  appName: string
  appDescription: string
  rawRequest: string
  formattedBrief: string
  images: ReferenceImage[]
  urgency?: RevisionPriority
}): StructuredRevisionRequest {
  const formatted = input.formattedBrief.trim()
  const title = titleFromFormatted(formatted, input.appName)

  return {
    meta: {
      id: `request-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      source: 'client-revision-portal',
      version: '2.2-chatgpt',
      engine: 'chatgpt-paste',
    },
    target: {
      appId: input.appId,
      appName: input.appName,
      appDescription: input.appDescription,
    },
    clientInput: {
      rawRequest: input.rawRequest.trim(),
      wordCount: input.rawRequest.trim().split(/\s+/).filter(Boolean).length,
    },
    instructions: {
      title,
      overview: formatted,
      goals: ['Implement the ChatGPT-formatted brief as written.'],
      constraints: [],
      outOfScope: [],
    },
    revisions: [
      {
        id: `rev-${crypto.randomUUID()}`,
        order: 1,
        category: 'other',
        priority: input.urgency ?? 'medium',
        summary: title,
        details: formatted,
        acceptanceCriteria: ['The developer brief pasted from ChatGPT is implemented as written.'],
      },
    ],
    references: input.images.map((image) => ({
      id: image.id,
      name: image.name,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      caption: image.caption || `Reference image: ${image.name}`,
      hasImageData: Boolean(image.dataUrl),
    })),
    agentGuidance: {
      executionOrder: [`1. Follow the ChatGPT-formatted brief for ${input.appName}.`],
      verificationSteps: ['Check every item in the Done when section of the pasted brief.'],
      notesForDeveloper: [
        'This brief was formatted by the client in ChatGPT. Implement it as written.',
        'The original informal notes are included as context only.',
      ],
    },
  }
}
