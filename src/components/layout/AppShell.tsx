import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
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
    function onResize() {
      if (window.matchMedia('(min-width: 768px)').matches) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
    <button type="button" className="site-nav-link" onClick={() => void signOut()} aria-label="Sign out">
      <LogOut className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.5} />
      Sign out
    </button>
  ) : (
    <button
      type="button"
      className="site-nav-link"
      onClick={() => {
        setMenuOpen(false)
        setSignInOpen(true)
      }}
    >
      Sign in
    </button>
  )

  return (
    <div className={cn('studio-root', theme === 'client' ? 'theme-client' : 'theme-internal')}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="wood-lintel">
        <div className="masthead-inner">
          <Link to="/" className="brand-inline">
            <BrandMark size="sm" />
            <span className="brand-copy">
              <span className="font-display text-[1.35rem] leading-none tracking-tight text-foreground sm:text-[1.5rem]">
                Dev Generator
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                For Airmen Voice
              </span>
            </span>
          </Link>

          <nav className="site-nav" aria-label="Main" aria-hidden={menuOpen ? 'true' : undefined}>
            {links}
            {accountControl}
          </nav>

          <div className="masthead-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 p-0"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="mobile-menu" id="mobile-nav">
          <Button variant="ghost" size="sm" className="mobile-menu-close h-11 w-11 p-0" onClick={() => setMenuOpen(false)}>
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
        <Outlet />
      </main>

      <footer className="studio-footer">
        <div className="studio-footer-inner">
          <p className="font-display text-base text-foreground">Dev Generator</p>
          <p className="text-xs tracking-wide text-muted-foreground">Revision intake for Airmen Voice</p>
        </div>
      </footer>

      {signInOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-japa-ink/35 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sign-in-title"
        >
          <Card framed className="my-6 w-full max-w-md sm:my-0">
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
