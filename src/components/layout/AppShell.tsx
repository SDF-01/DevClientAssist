import { Link, NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FilePlus2, List, Settings, LogOut, Circle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface AppShellProps {
  theme?: 'client' | 'internal'
}

export function AppShell({ theme = 'client' }: AppShellProps) {
  const { user, signOut, isInternal, signInDemo } = useAuth()

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200',
      isActive
        ? 'bg-accent-primary text-japa-warm-white'
        : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
    )

  return (
    <div
      className={cn(
        'min-h-screen',
        theme === 'client' ? 'theme-client bg-surface-base' : 'theme-internal bg-surface-internal',
      )}
    >
      <header className="border-b border-border bg-surface-elevated/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5 sm:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-surface-muted transition-colors group-hover:border-japa-bamboo/35">
              <Circle className="h-4 w-4 text-japa-bamboo" strokeWidth={1.5} />
            </span>
            <div>
              <span className="font-display text-xl font-medium tracking-tight text-foreground">Revision Portal</span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-japa-bamboo">
                Airmen Voice
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
                <List className="h-4 w-4" strokeWidth={1.5} /> My Requests
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
                <span className="hidden text-sm text-muted-foreground sm:inline">{user.full_name}</span>
                <Button variant="ghost" size="sm" onClick={() => void signOut()} aria-label="Sign out">
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={() => signInDemo('client_editor')}>
                  Client Demo
                </Button>
                <Button variant="primary" size="sm" onClick={() => signInDemo('developer')}>
                  Dev Demo
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}
