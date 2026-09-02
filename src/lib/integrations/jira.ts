import type { RevisionItemRecord, RevisionRequestWithRelations } from '@/types/database'

export interface JiraTicketStub {
  summary: string
  description: string
  issuetype: string
  priority: { name: string }
  labels: string[]
}

export function revisionItemToJiraTicket(item: RevisionItemRecord, revision: RevisionRequestWithRelations): JiraTicketStub {
  const priorityNames = { critical: 'Highest', high: 'High', medium: 'Medium', low: 'Low' }
  return {
    summary: `[${revision.project?.name ?? 'Project'}] ${item.summary}`,
    description: [
      item.details,
      '',
      '*Acceptance Criteria:*',
      ...item.acceptance_criteria.map((c) => `* ${c}`),
      '',
      `Revision ID: ${revision.id}`,
    ].join('\n'),
    issuetype: 'Task',
    priority: { name: priorityNames[item.priority] },
    labels: [item.category, 'client-revision'],
  }
}

export function exportJiraTickets(revision: RevisionRequestWithRelations): string {
  const items = revision.items ?? []
  const tickets = items.map((item) => revisionItemToJiraTicket(item, revision))
  return JSON.stringify({ issues: tickets }, null, 2)
}
