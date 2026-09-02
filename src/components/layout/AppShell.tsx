import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, FilePlus2, List, Settings, LogOut, UserRound, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
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
  const { pathname } = useLocation()
  const isLanding = pathname === '/'
  const [signInOpen, setSignInOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const navClass =
    'wood-tab inline-flex items-center gap-2 rounded-[2px] px-4 py-2 text-sm font-medium tracking-wide'

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setSignInOpen(false)
      setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const links = (
    <>
      <NavLink to="/submit" onClick={() => setMenuOpen(false)}>
        {({ isActive }) => (
          <span className={navClass} data-active={isActive ? 'true' : 'false'}>
            <FilePlus2 className="h-4 w-4" strokeWidth={1.5} />
            New request
          </span>
        )}
      </NavLink>
      <NavLink to="/requests" onClick={() => setMenuOpen(false)}>
        {({ isActive }) => (
          <span className={navClass} data-active={isActive ? 'true' : 'false'}>
            <List className="h-4 w-4" strokeWidth={1.5} />
            My requests
          </span>
        )}
      </NavLink>
      {isInternal ? (
        <>
          <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
            {({ isActive }) => (
              <span className={navClass} data-active={isActive ? 'true' : 'false'}>
                <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />
                Inbox
              </span>
            )}
          </NavLink>
          <NavLink to="/admin/org" onClick={() => setMenuOpen(false)}>
            {({ isActive }) => (
              <span className={navClass} data-active={isActive ? 'true' : 'false'}>
                <Settings className="h-4 w-4" strokeWidth={1.5} />
                Admin
              </span>
            )}
          </NavLink>
        </>
      ) : null}
    </>
  )

  return (
    <div className={cn('studio-root', theme === 'client' ? 'theme-client' : 'theme-internal')}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {isLanding ? null : <StudioAtmosphere />}

      <header className="wood-lintel">
        <div className="relative z-10 mx-auto flex max-w-[1080px] items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <BrandMark size="md" className="transition-transform duration-300 group-hover:-rotate-2" />
            <div>
              <span className="font-display text-[1.65rem] leading-none tracking-tight text-[#3f3b36]">
                Dev Generator
              </span>
              <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.3em] text-[#8f837a]">
                For Airmen Voice
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex" aria-label="Main">
            {links}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden max-w-[160px] truncate text-sm text-[#5e5e5e] sm:inline">
                  {user.full_name || user.email}
                </span>
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
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
        {menuOpen ? (
          <nav id="mobile-nav" className="mobile-drawer flex flex-col gap-2 md:hidden" aria-label="Mobile">
            {links}
          </nav>
        ) : null}
      </header>

      <main id="main-content" className={isLanding ? 'landing-stage' : 'studio-stage'} tabIndex={-1}>
        {isLanding ? (
          <Outlet />
        ) : (
          <div className="linen-tray rounded-[2px] px-4 py-7 pl-7 sm:px-8 sm:py-9 sm:pl-11">
            <Outlet />
          </div>
        )}
      </main>

      <footer className="studio-footer">
        <div className="studio-footer-inner">
          <p className="font-display text-lg text-[#3f3b36]">Dev Generator</p>
          <img src="/art/table-still-life.png" alt="" aria-hidden />
          <p className="text-xs tracking-wide text-[#8f837a]">Revision intake for Airmen Voice</p>
        </div>
      </footer>

      {signInOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#5e5e5e]/35 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sign-in-title"
        >
          <Card framed className="w-full max-w-md">
            <h2 id="sign-in-title" className="sr-only">
              Sign in
            </h2>
            <SignInPanel onClose={() => setSignInOpen(false)} />
          </Card>
        </div>
      ) : null}
    </div>
  )
}
