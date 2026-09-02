import { Link, NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FilePlus2, List, Settings, LogOut, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AirmenVoiceMark } from '@/components/brand/AirmenVoiceMark'
import { SignInPanel } from '@/components/auth/SignInPanel'
import { cn } from '@/lib/utils'

interface AppShellProps {
  theme?: 'client' | 'internal'
}

export function AppShell({ theme = 'client' }: AppShellProps) {
  const { user, signOut, isInternal } = useAuth()
  const [signInOpen, setSignInOpen] = useState(false)

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200',
      isActive
        ? 'bg-accent-primary text-japa-warm-white shadow-wood'
        : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
    )

  return (
    <div
      className={cn(
        'min-h-screen',
        theme === 'client' ? 'theme-client bg-surface-base' : 'theme-internal bg-surface-internal',
      )}
    >
      <header className="border-b border-border bg-surface-elevated/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <AirmenVoiceMark size="md" className="transition-transform group-hover:scale-[1.02]" />
            <div>
              <span className="font-display text-2xl font-medium tracking-tight text-foreground">Airmen Voice</span>
              <span className="mt-0.5 block font-accent text-[11px] tracking-[0.28em] text-taupe uppercase">
                Revisions
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            <NavLink to="/submit" className={navLinkClass}>
              <span className="inline-flex items-center gap-2">
                <FilePlus2 className="h-4 w-4" strokeWidth={1.5} /> Submit
              </span>
            </NavLink>
            <NavLink to="/requests" className={navLinkClass}>
              <span className="inline-flex items-center gap-2">
                <List className="h-4 w-4" strokeWidth={1.5} /> Requests
              </span>
            </NavLink>
            {isInternal ? (
              <>
                <NavLink to="/admin" className={navLinkClass}>
                  <span className="inline-flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} /> Triage
                  </span>
                </NavLink>
                <NavLink to="/admin/org" className={navLinkClass}>
                  <span className="inline-flex items-center gap-2">
                    <Settings className="h-4 w-4" strokeWidth={1.5} /> Admin
                  </span>
                </NavLink>
              </>
            ) : null}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:inline">{user.full_name || user.email}</span>
                <Button variant="ghost" size="sm" onClick={() => void signOut()} aria-label="Sign out">
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setSignInOpen(true)}>
                <UserRound className="h-4 w-4" strokeWidth={1.5} />
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <Outlet />
      </main>

      {signInOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/25 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Sign in"
        >
          <Card className="w-full max-w-md border-border/80 bg-surface-elevated shadow-lift">
            <SignInPanel onClose={() => setSignInOpen(false)} />
          </Card>
        </div>
      ) : null}
    </div>
  )
}
