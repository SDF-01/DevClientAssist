import { Navigate, Outlet } from 'react-router-dom'
import { SignInPanel } from '@/components/auth/SignInPanel'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'

export function RequireInternal() {
  const { loading, isAuthenticated, isInternal } = useAuth()

  if (loading) {
    return <p className="text-sm text-muted-foreground">Checking access…</p>
  }

  if (isAuthenticated && !isInternal) {
    return <Navigate to="/" replace />
  }

  if (!isAuthenticated) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <p className="font-display text-2xl text-foreground">Team sign in</p>
        <p className="mt-2 mb-5 text-sm leading-relaxed text-muted-foreground">
          Inbox and admin tools are limited to the site owner and approved team members.
        </p>
        <SignInPanel />
      </Card>
    )
  }

  return <Outlet />
}
