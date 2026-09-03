import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRevisions } from '@/lib/data/revisions'
import { StatusBadge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import type { RevisionRequestWithRelations, RevisionStatus } from '@/types/database'
import { formatDate } from '@/lib/utils'

const KANBAN_COLUMNS: RevisionStatus[] = [
  'submitted',
  'in_review',
  'needs_clarification',
  'approved',
  'exported',
  'in_progress',
  'done',
]

export function DashboardPage() {
  const [requests, setRequests] = useState<RevisionRequestWithRelations[]>([])
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [filterProject, setFilterProject] = useState('')

  useEffect(() => {
    void listRevisions().then(setRequests)
  }, [])

  const projects = useMemo(() => {
    const map = new Map<string, string>()
    for (const req of requests) {
      if (req.project) map.set(req.project.id, req.project.name)
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [requests])

  const filtered = filterProject ? requests.filter((r) => r.project_id === filterProject) : requests

  return (
    <div className="space-y-6">
      <CardHeader className="page-head px-0">
        <div>
          <p className="section-label">Inbox</p>
          <h1 className="font-display text-3xl font-normal">Requests in progress</h1>
        </div>
        <div className="page-actions w-full max-w-md">
          <Select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            options={[{ value: '', label: 'All projects' }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
          />
          <Select
            value={view}
            onChange={(e) => setView(e.target.value as 'kanban' | 'table')}
            options={[
              { value: 'kanban', label: 'Kanban' },
              { value: 'table', label: 'Table' },
            ]}
          />
        </div>
      </CardHeader>

      {view === 'kanban' ? (
        <div className="grid gap-4 overflow-x-auto md:grid-cols-3 xl:grid-cols-4">
          {KANBAN_COLUMNS.map((status) => {
            const column = filtered.filter((r) => r.status === status)
            return (
              <div
                key={status}
                className="min-w-[240px] rounded-[var(--radius-md)] border border-border bg-surface-muted/30 p-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="text-xs font-medium text-muted-foreground">{column.length}</span>
                </div>
                <ul className="space-y-2">
                  {column.map((req) => (
                    <li key={req.id}>
                      <Link to={`/admin/revisions/${req.id}`}>
                        <Card className="p-3 text-sm transition-all duration-200 hover:border-japa-sage/25 hover:shadow-lift">
                          <p className="font-medium">{req.title}</p>
                          <p className="text-xs text-muted-foreground">{req.project?.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatDate(req.created_at)}</p>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Project</th>
                <th className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Urgency</th>
                <th className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Ready?</th>
                <th className="p-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className="border-b border-border/50 transition-colors hover:bg-surface-muted/30">
                  <td className="p-3">
                    <Link
                      to={`/admin/revisions/${req.id}`}
                      className="font-medium text-japa-charcoal underline-offset-2 hover:text-japa-sage hover:underline"
                    >
                      {req.title}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground">{req.project?.name}</td>
                  <td className="p-3">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="p-3 capitalize text-muted-foreground">{req.urgency}</td>
                  <td className="p-3 text-muted-foreground">{req.completeness_score ?? '-'}%</td>
                  <td className="p-3 text-muted-foreground">{formatDate(req.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
