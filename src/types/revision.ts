export type RevisionPriority = 'low' | 'medium' | 'high' | 'critical'

export type RevisionCategory =
  | 'ui'
  | 'ux'
  | 'content'
  | 'functionality'
  | 'performance'
  | 'accessibility'
  | 'other'

export interface ClientApp {
  id: string
  name: string
  description: string
}

export interface ReferenceImage {
  id: string
  name: string
  mimeType: string
  sizeBytes: number
  caption: string
  dataUrl: string
  annotationData?: string | null
  storagePath?: string
  publicUrl?: string
}

export interface RevisionItem {
  id: string
  order: number
  category: RevisionCategory
  priority: RevisionPriority
  summary: string
  details: string
  acceptanceCriteria: string[]
}

export interface StructuredRevisionRequest {
  meta: {
    id: string
    createdAt: string
    source: 'client-revision-portal'
    version: string
    engine?: 'local-rewrite' | 'llm-rewrite' | 'chatgpt-paste'
  }
  target: {
    appId: string
    appName: string
    appDescription: string
  }
  clientInput: {
    rawRequest: string
    wordCount: number
  }
  instructions: {
    title: string
    overview: string
    goals: string[]
    constraints: string[]
    outOfScope: string[]
  }
  revisions: RevisionItem[]
  references: Array<{
    id: string
    name: string
    mimeType: string
    sizeBytes: number
    caption: string
    hasImageData: boolean
  }>
  agentGuidance: {
    executionOrder: string[]
    verificationSteps: string[]
    notesForDeveloper: string[]
  }
}

export interface RevisionFormState {
  appId: string
  rawRequest: string
  images: ReferenceImage[]
}
