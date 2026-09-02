import { Link, NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FilePlus2, List, Settings, LogOut, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { BrandMark } from '@/components/brand/BrandMark'
import { StudioAtmosphere } from '@/components/brand/StudioAtmosphere'
import { SignInPanel } from '@/components/auth/SignInPanel'
import { cn } from '@/lib/utils'

interface AppShellProps {
  theme?: 'client' | 'internal'
}

export function AppShell({ theme = 'client' }: AppShellProps) {
  const { user, signOut, isInternal } = useAuth()
  const [signInOpen, setSignInOpen] = useState(false)

  const navClass =
    'wood-tab inline-flex items-center gap-2 rounded-[2px] px-4 py-2 text-sm font-medium tracking-wide'

  return (
    <div className={cn('studio-root', theme === 'client' ? 'theme-client' : 'theme-internal')}>
      <StudioAtmosphere />

      <header className="wood-lintel">
        <div className="relative z-10 mx-auto flex max-w-[1180px] items-center justify-between gap-6 px-4 py-4 sm:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <BrandMark size="md" className="transition-transform duration-300 group-hover:-rotate-2" />
            <div>
              <span className="font-display text-[1.7rem] leading-none tracking-tight text-[#3f3b36]">
                Dev Generator
              </span>
              <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.34em] text-[#8f837a]">
                Studio desk
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex" aria-label="Main">
            <NavLink to="/submit">
              {({ isActive }) => (
                <span className={navClass} data-active={isActive ? 'true' : 'false'}>
                  <FilePlus2 className="h-4 w-4" strokeWidth={1.5} />
                  Submit
                </span>
              )}
            </NavLink>
            <NavLink to="/requests">
              {({ isActive }) => (
                <span className={navClass} data-active={isActive ? 'true' : 'false'}>
                  <List className="h-4 w-4" strokeWidth={1.5} />
                  Requests
                </span>
              )}
            </NavLink>
            {isInternal ? (
              <>
                <NavLink to="/admin">
                  {({ isActive }) => (
                    <span className={navClass} data-active={isActive ? 'true' : 'false'}>
                      <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />
                      Triage
                    </span>
                  )}
                </NavLink>
                <NavLink to="/admin/org">
                  {({ isActive }) => (
                    <span className={navClass} data-active={isActive ? 'true' : 'false'}>
                      <Settings className="h-4 w-4" strokeWidth={1.5} />
                      Admin
                    </span>
                  )}
                </NavLink>
              </>
            ) : null}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-[#5e5e5e] sm:inline">{user.full_name || user.email}</span>
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

      <main className="studio-stage">
        <div className="shoji-stage rounded-[2px] px-4 py-8 sm:px-8 sm:py-10">
          <Outlet />
        </div>
      </main>

      <footer className="studio-footer">
        <div className="studio-footer-inner">
          <p className="font-display text-lg text-[#3f3b36]">Dev Generator</p>
          <img src="/art/lantern.svg" alt="" aria-hidden className="h-10 w-7" />
          <p className="font-accent text-xs tracking-[0.28em] text-[#606c5a]">開発</p>
        </div>
      </footer>

      {signInOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#5e5e5e]/35 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Sign in"
        >
          <Card className="w-full max-w-md">
            <SignInPanel onClose={() => setSignInOpen(false)} />
          </Card>
        </div>
      ) : null}
    </div>
  )
}
