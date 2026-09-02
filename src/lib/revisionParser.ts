import type { ReferenceImage, RevisionPriority, StructuredRevisionRequest } from '../types/revision'
import { getAppById } from '../data/apps'
import { rewriteClientRequest, type RewriteContext } from './rewriteEngine'

export interface StructureOptions {
  urgency?: RevisionPriority
  clientNotes?: string
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export function structureRevisionRequest(
  appId: string,
  rawRequest: string,
  images: ReferenceImage[],
  options?: StructureOptions,
): StructuredRevisionRequest {
  const app = getAppById(appId)
  if (!app) {
    throw new Error('Selected application was not found.')
  }

  const cleanedRequest = rawRequest.trim()
  if (!cleanedRequest) {
    throw new Error('Revision request text is required.')
  }

  const context: RewriteContext = {
    appName: app.name,
    appDescription: app.description,
    urgency: options?.urgency,
    clientNotes: options?.clientNotes,
    images,
  }

  const rewritten = rewriteClientRequest(cleanedRequest, context)
  const wordCount = cleanedRequest.split(/\s+/).filter(Boolean).length

  return {
    meta: {
      id: createId('request'),
      createdAt: new Date().toISOString(),
      source: 'client-revision-portal',
      version: '2.1-engine',
      engine: rewritten.engine,
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
      title: rewritten.title,
      overview: rewritten.overview,
      goals: rewritten.goals,
      constraints: rewritten.constraints,
      outOfScope: rewritten.outOfScope,
    },
    revisions: rewritten.revisions,
    references: images.map((image) => ({
      id: image.id,
      name: image.name,
      mimeType: image.mimeType,
      sizeBytes: image.sizeBytes,
      caption: image.caption || `Reference image: ${image.name}`,
      hasImageData: Boolean(image.dataUrl),
    })),
    agentGuidance: {
      executionOrder: rewritten.executionOrder,
      verificationSteps: rewritten.verificationSteps,
      notesForDeveloper: rewritten.notesForDeveloper,
    },
  }
}

export function formatStructuredPreview(request: StructuredRevisionRequest): string {
  const lines: string[] = [
    `# ${request.instructions.title}`,
    '',
    `Engine: ${request.meta.engine ?? 'local-rewrite'}`,
    '',
    '## Overview',
    request.instructions.overview,
    '',
    '## Goals',
    ...request.instructions.goals.map((goal) => `- ${goal}`),
  ]

  if (request.instructions.constraints.length > 0) {
    lines.push('', '## Preserve', ...request.instructions.constraints.map((item) => `- ${item}`))
  }

  lines.push('', '## Revision items')

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
    lines.push('', '## Reference images')
    for (const reference of request.references) {
      lines.push(`- ${reference.name}: ${reference.caption}`)
    }
  }

  lines.push(
    '',
    '## Developer notes',
    ...request.agentGuidance.notesForDeveloper.map((note) => `- ${note}`),
  )

  return lines.join('\n')
}
