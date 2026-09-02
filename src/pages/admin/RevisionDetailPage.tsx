import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  getRevision,
  updateRevisionFields,
  updateRevisionItems,
  updateRevisionStatus,
} from '@/lib/data/revisions'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Textarea } from '@/components/ui/Input'
import { ClarificationThread } from '@/components/client/ClarificationThread'
import { ToonExportPanel } from '@/components/internal/ToonExportPanel'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import type { RevisionItemRecord, RevisionRequestWithRelations, RevisionStatus } from '@/types/database'
import { formatDate } from '@/lib/utils'

export function RevisionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [revision, setRevision] = useState<RevisionRequestWithRelations | null>(null)
  const [items, setItems] = useState<RevisionItemRecord[]>([])
  const [internalNotes, setInternalNotes] = useState('')

  function reload() {
    if (!id) return
    void getRevision(id).then((data) => {
      if (data) {
        setRevision(data)
        setItems(data.items ?? [])
        setInternalNotes(data.internal_notes ?? '')
      }
    })
  }

  useEffect(() => {
    reload()
  }, [id])

  async function changeStatus(status: RevisionStatus) {
    if (!revision) return
    await updateRevisionStatus(revision.id, status, user?.id ?? null)
    showToast(`Status updated to ${status.replace('_', ' ')}.`, 'success')
    reload()
  }

  async function saveItems() {
    if (!revision) return
    await updateRevisionItems(revision.id, items)
    await updateRevisionFields(revision.id, { internal_notes: internalNotes })
    showToast('Changes saved.', 'success')
    reload()
  }

  function updateItem(index: number, field: keyof RevisionItemRecord, value: string) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  if (!revision) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="space-y-6">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 px-0">
        <div>
          <p className="japandi-kicker">Triage</p>
          <CardTitle className="text-3xl font-normal">{revision.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {revision.project?.name} · {formatDate(revision.created_at)}
          </p>
        </div>
        <StatusBadge status={revision.status} />
      </CardHeader>

      <Card className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => void changeStatus('in_review')}>
          Start Review
        </Button>
        <Button size="sm" variant="secondary" onClick={() => void changeStatus('needs_clarification')}>
          Needs Clarification
        </Button>
        <Button size="sm" onClick={() => void changeStatus('approved')}>
          Approve
        </Button>
        <Button size="sm" variant="secondary" onClick={() => void changeStatus('in_progress')}>
          In Progress
        </Button>
        <Button size="sm" variant="secondary" onClick={() => void changeStatus('done')}>
          Mark Done
        </Button>
        <Button size="sm" variant="ghost" onClick={() => void changeStatus('rejected')}>
          Reject
        </Button>
      </Card>

      <Card>
        <p className="japandi-kicker mb-2">Items</p>
        <h3 className="mb-4 font-display text-lg font-medium">Editable revision items</h3>
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={item.id} className="space-y-2 rounded-[var(--radius-sm)] border border-border bg-surface-muted/20 p-4">
              <Input label="Summary" value={item.summary} onChange={(e) => updateItem(index, 'summary', e.target.value)} />
              <Textarea label="Details" value={item.details} onChange={(e) => updateItem(index, 'details', e.target.value)} rows={3} />
              <div className="grid gap-2 sm:grid-cols-2">
                <Input label="Category" value={item.category} onChange={(e) => updateItem(index, 'category', e.target.value)} />
                <Input label="Priority" value={item.priority} onChange={(e) => updateItem(index, 'priority', e.target.value)} />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-3">
          <Textarea label="Internal Notes" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={4} />
          <Button onClick={() => void saveItems()}>Save Changes</Button>
        </div>
      </Card>

      <ToonExportPanel revision={revision} actorId={user?.id ?? null} onExported={reload} />

      {revision.events && revision.events.length > 0 ? (
        <Card>
          <p className="japandi-kicker mb-2">History</p>
          <h3 className="mb-3 font-display text-lg font-medium">Audit log</h3>
          <ul className="space-y-2 text-sm">
            {revision.events.map((event) => (
              <li key={event.id} className="flex justify-between gap-4 border-b border-border/50 py-2">
                <span className="capitalize">{event.event_type.replace(/_/g, ' ')}</span>
                <span className="text-muted-foreground">{formatDate(event.created_at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <ClarificationThread
          revisionId={revision.id}
          messages={revision.messages ?? []}
          authorName={user?.full_name ?? 'Team'}
          authorId={user?.id ?? null}
          isInternal
          onUpdate={reload}
        />
      </Card>
    </div>
  )
}
