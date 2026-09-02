import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRevisions } from '@/lib/data/revisions'
import { StatusBadge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
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

  if (loading) return <p className="text-muted-foreground">Loading requests...</p>

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <p className="section-label">Archive</p>
        <CardTitle className="text-3xl font-normal">My revision requests</CardTitle>
      </CardHeader>

      {requests.length === 0 ? (
        <Card>
          <p className="text-muted-foreground">
            No requests yet.{' '}
            <Link to="/submit" className="text-moss underline-offset-2 hover:underline">
              Submit your first revision
            </Link>
            .
          </p>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {requests.map((req) => (
            <li key={req.id}>
              <Link to={`/requests/${req.id}`}>
                <Card className="transition-all duration-200 hover:border-japa-sage/25 hover:shadow-lift">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-medium">{req.title}</h3>
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
