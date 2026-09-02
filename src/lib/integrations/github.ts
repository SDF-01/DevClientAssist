import type { RevisionRequestWithRelations } from '@/types/database'
import type { StructuredRevisionRequest } from '@/types/revision'

export interface GitHubWebhookPayload {
  event: 'revision.approved'
  revisionId: string
  projectRepo: string | null
  defaultBranch: string | null
  toonContent: string
  title: string
}

export function buildGitHubWebhookPayload(
  revision: RevisionRequestWithRelations,
  toonContent: string,
): GitHubWebhookPayload {
  return {
    event: 'revision.approved',
    revisionId: revision.id,
    projectRepo: revision.project?.github_repo ?? null,
    defaultBranch: revision.project?.default_branch ?? 'main',
    toonContent,
    title: revision.title,
  }
}

export async function triggerGitHubWebhook(payload: GitHubWebhookPayload): Promise<boolean> {
  const webhookUrl = import.meta.env.VITE_GITHUB_WEBHOOK_URL
  if (!webhookUrl) return false

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return response.ok
}

export function buildCursorAgentBundle(revision: RevisionRequestWithRelations, toonContent: string) {
  const structured = revision.structured_payload as unknown as StructuredRevisionRequest
  return {
    revisionId: revision.id,
    project: revision.project?.name,
    githubRepo: revision.project?.github_repo,
    toon: toonContent,
    imageUrls: (revision.attachments ?? []).map((a) => a.public_url).filter(Boolean),
    executionOrder: structured?.agentGuidance?.executionOrder ?? [],
  }
}
