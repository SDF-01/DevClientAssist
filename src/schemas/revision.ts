import { z } from 'zod'

export const revisionPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])
export const revisionCategorySchema = z.enum([
  'ui',
  'ux',
  'content',
  'functionality',
  'performance',
  'accessibility',
  'other',
])
export const revisionStatusSchema = z.enum([
  'draft',
  'submitted',
  'in_review',
  'needs_clarification',
  'approved',
  'exported',
  'in_progress',
  'done',
  'rejected',
])

export const revisionItemSchema = z.object({
  id: z.string(),
  order: z.number(),
  category: revisionCategorySchema,
  priority: revisionPrioritySchema,
  summary: z.string(),
  details: z.string(),
  acceptanceCriteria: z.array(z.string()),
})

export const structuredRevisionSchema = z.object({
  meta: z.object({
    id: z.string(),
    createdAt: z.string(),
    source: z.literal('client-revision-portal'),
    version: z.string(),
    engine: z.enum(['local-rewrite', 'llm-rewrite']).optional(),
  }),
  target: z.object({
    appId: z.string(),
    appName: z.string(),
    appDescription: z.string(),
  }),
  clientInput: z.object({
    rawRequest: z.string(),
    wordCount: z.number(),
  }),
  instructions: z.object({
    title: z.string(),
    overview: z.string(),
    goals: z.array(z.string()),
    constraints: z.array(z.string()),
    outOfScope: z.array(z.string()),
  }),
  revisions: z.array(revisionItemSchema),
  references: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      mimeType: z.string(),
      sizeBytes: z.number(),
      caption: z.string(),
      hasImageData: z.boolean(),
      storagePath: z.string().optional(),
      publicUrl: z.string().optional(),
    }),
  ),
  agentGuidance: z.object({
    executionOrder: z.array(z.string()),
    verificationSteps: z.array(z.string()),
    notesForDeveloper: z.array(z.string()),
  }),
})

export const submitRevisionSchema = z.object({
  projectId: z.string().min(1),
  rawRequest: z.string().min(10),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  urgency: revisionPrioritySchema.default('medium'),
  dueDate: z.string().optional(),
  clientNotes: z.string().optional(),
})

export type StructuredRevision = z.infer<typeof structuredRevisionSchema>
export type SubmitRevisionInput = z.infer<typeof submitRevisionSchema>
