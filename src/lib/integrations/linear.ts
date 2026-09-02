import type { RevisionItemRecord, RevisionRequestWithRelations } from '@/types/database'

export interface LinearTicketStub {
  title: string
  description: string
  priority: number
  labels: string[]
}

export function revisionItemToLinearTicket(item: RevisionItemRecord, revision: RevisionRequestWithRelations): LinearTicketStub {
  const priorityMap = { critical: 1, high: 2, medium: 3, low: 4 }
  return {
    title: `[${revision.project?.name ?? 'Project'}] ${item.summary}`,
    description: [
      item.details,
      '',
      'Acceptance Criteria:',
      ...item.acceptance_criteria.map((c) => `- ${c}`),
      '',
      `Revision ID: ${revision.id}`,
    ].join('\n'),
    priority: priorityMap[item.priority],
    labels: [item.category, 'client-revision'],
  }
}

export function exportLinearTickets(revision: RevisionRequestWithRelations): string {
  const items = revision.items ?? []
  const tickets = items.map((item) => revisionItemToLinearTicket(item, revision))
  return JSON.stringify(tickets, null, 2)
}
