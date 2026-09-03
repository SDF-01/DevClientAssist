export type UserRole = 'client_viewer' | 'client_editor' | 'developer' | 'admin'

export type RevisionStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'needs_clarification'
  | 'approved'
  | 'exported'
  | 'in_progress'
  | 'done'
  | 'rejected'

export type RevisionPriority = 'low' | 'medium' | 'high' | 'critical'

export type RevisionCategory =
  | 'ui'
  | 'ux'
  | 'content'
  | 'functionality'
  | 'performance'
  | 'accessibility'
  | 'other'

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Project {
  id: string
  organization_id: string
  name: string
  slug: string
  description: string
  github_repo: string | null
  default_branch: string | null
  is_active: boolean
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  organization_id: string | null
  created_at: string
}

export interface RevisionRequest {
  id: string
  organization_id: string
  project_id: string
  submitted_by: string | null
  assignee_id: string | null
  status: RevisionStatus
  title: string
  raw_request: string
  structured_payload: Record<string, unknown> | null
  internal_notes: string | null
  client_notes: string | null
  contact_name: string | null
  contact_email: string | null
  urgency: RevisionPriority
  due_date: string | null
  version: number
  parent_revision_id: string | null
  completeness_score: number | null
  created_at: string
  updated_at: string
  submitted_at: string | null
}

export interface RevisionItemRecord {
  id: string
  revision_id: string
  order_index: number
  category: RevisionCategory
  priority: RevisionPriority
  summary: string
  details: string
  acceptance_criteria: string[]
  created_at: string
}

export interface RevisionAttachment {
  id: string
  revision_id: string
  storage_path: string
  file_name: string
  mime_type: string
  size_bytes: number
  caption: string
  annotation_data: string | null
  public_url: string | null
  created_at: string
}

export interface RevisionEvent {
  id: string
  revision_id: string
  actor_id: string | null
  event_type: string
  payload: Record<string, unknown>
  created_at: string
}

export interface RevisionExport {
  id: string
  revision_id: string
  format: 'toon' | 'markdown' | 'json' | 'pdf'
  file_name: string
  content: string | null
  storage_path: string | null
  created_by: string | null
  created_at: string
}

export interface ClarificationMessage {
  id: string
  revision_id: string
  author_id: string | null
  author_name: string
  is_internal: boolean
  message: string
  created_at: string
}

export interface RevisionTemplate {
  id: string
  name: string
  description: string
  template_text: string
  category: RevisionCategory
}

export type AccountRequestStatus = 'pending' | 'approved' | 'denied'

export interface AccountRequest {
  id: string
  email: string
  full_name: string
  status: AccountRequestStatus
  created_at: string
  reviewed_at: string | null
  reviewer_email: string | null
}

export interface RevisionRequestWithRelations extends RevisionRequest {
  project?: Project
  items?: RevisionItemRecord[]
  attachments?: RevisionAttachment[]
  events?: RevisionEvent[]
  messages?: ClarificationMessage[]
}
