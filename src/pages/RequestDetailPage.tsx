import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getRevision } from '@/lib/data/revisions'
import { StatusBadge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatusTimeline } from '@/components/client/StatusTimeline'
import { ClarificationThread } from '@/components/client/ClarificationThread'
import { Button } from '@/components/ui/Button'
import { downloadPdfReceipt } from '@/lib/pdfReceipt'
import { useAuth } from '@/hooks/useAuth'
import type { RevisionRequestWithRelations } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { formatStructuredPreview } from '@/lib/revisionParser'
import type { StructuredRevisionRequest } from '@/types/revision'

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isInternal } = useAuth()
  const [revision, setRevision] = useState<RevisionRequestWithRelations | null>(null)

  function reload() {
    if (!id) return
    void getRevision(id).then(setRevision)
  }

  useEffect(() => {
    reload()
  }, [id])

  if (!revision) return <p className="text-muted-foreground">Loading...</p>

  const structured = revision.structured_payload as unknown as StructuredRevisionRequest | null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <CardHeader className="px-0">
          <p className="section-label">Request</p>
          <h1 className="font-display text-3xl font-normal">{revision.title}</h1>
          <p className="text-sm text-muted-foreground">
            {revision.project?.name} · {formatDate(revision.created_at)}
          </p>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={revision.status} />
          {isInternal ? (
            <Link to={`/admin/revisions/${revision.id}`}>
              <Button variant="secondary" size="sm">
                Open in inbox
              </Button>
            </Link>
          ) : null}
          <Button variant="secondary" size="sm" onClick={() => downloadPdfReceipt(revision)}>
            Download receipt
          </Button>
        </div>
      </div>

      <StatusTimeline currentStatus={revision.status} />

      <Card>
        <p className="section-label mb-2">What you sent</p>
        <h2 className="mb-3 font-display text-lg font-medium">Your request</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{revision.raw_request}</p>
      </Card>

      {structured ? (
        <Card>
          <p className="section-label mb-2">Team brief</p>
          <h2 className="mb-3 font-display text-lg font-medium">How this will be read</h2>
          <pre className="code-block-light max-h-96 overflow-auto whitespace-pre-wrap rounded-[var(--radius-sm)] p-4 text-xs font-mono">
            {formatStructuredPreview(structured)}
          </pre>
        </Card>
      ) : null}

      <Card>
        <ClarificationThread
          revisionId={revision.id}
          messages={revision.messages ?? []}
          authorName={user?.full_name ?? 'Guest'}
          authorId={user?.id ?? null}
          isInternal={isInternal}
          onUpdate={reload}
        />
      </Card>
    </div>
  )
}
