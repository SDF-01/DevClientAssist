import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LogOut, UserRound, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { BrandMark } from '@/components/brand/BrandMark'
import { SignInPanel } from '@/components/auth/SignInPanel'
import { cn } from '@/lib/utils'

interface AppShellProps {
  theme?: 'client' | 'internal'
}

export function AppShell({ theme = 'client' }: AppShellProps) {
  const { user, signOut, isInternal } = useAuth()
  const { pathname } = useLocation()
  const [signInOpen, setSignInOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setSignInOpen(false)
      setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen || signInOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen, signInOpen])

  const links = (
    <>
      <NavLink to="/submit" onClick={() => setMenuOpen(false)}>
        {({ isActive }) => (
          <span className="site-nav-link" data-active={isActive ? 'true' : 'false'}>
            Request
          </span>
        )}
      </NavLink>
      <NavLink to="/requests" onClick={() => setMenuOpen(false)}>
        {({ isActive }) => (
          <span className="site-nav-link" data-active={isActive ? 'true' : 'false'}>
            My requests
          </span>
        )}
      </NavLink>
      {isInternal ? (
        <>
          <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
            {({ isActive }) => (
              <span className="site-nav-link" data-active={isActive ? 'true' : 'false'}>
                Inbox
              </span>
            )}
          </NavLink>
          <NavLink to="/admin/org" onClick={() => setMenuOpen(false)}>
            {({ isActive }) => (
              <span className="site-nav-link" data-active={isActive ? 'true' : 'false'}>
                Admin
              </span>
            )}
          </NavLink>
        </>
      ) : null}
    </>
  )

  const accountControl = user ? (
    <div className="flex flex-col items-center gap-2 sm:flex-row">
      <span className="max-w-[220px] truncate text-sm text-muted-foreground">{user.full_name || user.email}</span>
      <Button variant="ghost" size="sm" onClick={() => void signOut()} aria-label="Sign out">
        <LogOut className="h-4 w-4" strokeWidth={1.5} />
        Sign out
      </Button>
    </div>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      className="site-nav-link border-0"
      onClick={() => {
        setMenuOpen(false)
        setSignInOpen(true)
      }}
    >
      <UserRound className="h-4 w-4" strokeWidth={1.5} />
      Sign in
    </Button>
  )

  return (
    <div className={cn('studio-root', theme === 'client' ? 'theme-client' : 'theme-internal')}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="wood-lintel">
        <div className="masthead-inner">
          <Button
            variant="ghost"
            size="sm"
            className="menu-trigger md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Menu</span>
          </Button>

          <Link to="/" className="brand-stack">
            <BrandMark size="md" />
            <span className="font-display text-[1.7rem] leading-none tracking-tight text-foreground">
              Dev Generator
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.32em] text-muted-foreground">
              For Airmen Voice
            </span>
          </Link>

          <nav className="site-nav" aria-label="Main">
            {links}
            {accountControl}
          </nav>
        </div>
      </header>

      {menuOpen ? (
        <div className="mobile-menu md:hidden" id="mobile-nav">
          <Button
            variant="ghost"
            size="sm"
            className="mobile-menu-close"
            onClick={() => setMenuOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
          <nav className="mobile-menu-nav" aria-label="Mobile">
            {links}
            {accountControl}
          </nav>
        </div>
      ) : null}

      <main id="main-content" className="studio-stage" tabIndex={-1}>
        <div className="linen-tray px-4 py-7 sm:px-8 sm:py-10">
          <Outlet />
        </div>
      </main>

      <footer className="studio-footer">
        <div className="studio-footer-inner">
          <p className="font-display text-lg text-foreground">Dev Generator</p>
          <p className="text-xs tracking-wide text-muted-foreground">Revision intake for Airmen Voice</p>
        </div>
      </footer>

      {signInOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-japa-ink/30 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sign-in-title"
        >
          <Card framed className="w-full max-w-md text-center">
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
