import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRevisions } from '@/lib/data/revisions'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { RevisionRequestWithRelations } from '@/types/database'
import { formatDate } from '@/lib/utils'

export function MyRequestsPage() {
  const [requests, setRequests] = useState<RevisionRequestWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void listRevisions().then((data) => {
      setRequests(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="text-center text-muted-foreground">Loading your requests...</p>

  return (
    <div className="space-y-6">
      <div className="page-head-start flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="section-label">Your work</p>
          <h1 className="font-display text-3xl font-normal">Requests</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Follow anything you have sent. Open a request to see status and replies.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/submit">
            <Button>New request</Button>
          </Link>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card framed className="mx-auto max-w-xl py-12 text-center">
          <p className="font-display text-2xl">Nothing here yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            When you send a request, it will show up here so you can track it.
          </p>
          <Link to="/submit" className="mt-6 inline-block">
            <Button>Start a request</Button>
          </Link>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {requests.map((req) => (
            <li key={req.id}>
              <Link to={`/requests/${req.id}`} className="block">
                <Card className="transition-all duration-200 hover:border-bamboo/30">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-medium">{req.title}</h2>
                      <p className="text-sm text-muted-foreground">{req.project?.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(req.created_at)}</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
