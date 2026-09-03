import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { listAccountRequests, reviewAccountAccess, type AccountRequest } from '@/lib/data/accounts'
import { formatDate } from '@/lib/utils'

export function AccountRequestsCard() {
  const { showToast } = useToast()
  const [requests, setRequests] = useState<AccountRequest[]>([])
  const [busyEmail, setBusyEmail] = useState<string | null>(null)

  async function refresh() {
    setRequests(await listAccountRequests())
  }

  useEffect(() => {
    void refresh().catch((error: unknown) => {
      showToast(error instanceof Error ? error.message : 'Could not load account requests.', 'error')
    })
  }, [showToast])

  async function review(email: string, status: 'approved' | 'denied') {
    setBusyEmail(email)
    try {
      await reviewAccountAccess(email, status)
      await refresh()
      showToast(status === 'approved' ? `Approved ${email}.` : `Denied ${email}.`, 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update that request.', 'error')
    } finally {
      setBusyEmail(null)
    }
  }

  const pending = requests.filter((request) => request.status === 'pending')
  const decided = requests.filter((request) => request.status !== 'pending')

  return (
    <Card>
      <p className="section-label mb-2">Accounts</p>
      <h3 className="mb-2 font-display text-lg font-medium">Approve new accounts</h3>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Only your email can sign in automatically. Everyone else waits here until you approve them.
      </p>

      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending account requests.</p>
      ) : (
        <ul className="space-y-3">
          {pending.map((request) => (
            <li key={request.id} className="border-b border-border/50 pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{request.email}</p>
                  <p className="text-xs text-muted-foreground">Requested {formatDate(request.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={busyEmail === request.email}
                    onClick={() => void review(request.email, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busyEmail === request.email}
                    onClick={() => void review(request.email, 'denied')}
                  >
                    Deny
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {decided.length > 0 ? (
        <ul className="mt-5 space-y-2 text-sm">
          {decided.map((request) => (
            <li key={request.id} className="flex justify-between gap-3 border-b border-border/30 py-1">
              <span>{request.email}</span>
              <span className="text-muted-foreground">{request.status}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  )
}
