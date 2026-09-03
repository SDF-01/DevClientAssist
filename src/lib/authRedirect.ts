export const PRODUCTION_SITE_URL = 'https://revision-portal-eight.vercel.app'

function isUnusedLocalhost3000(origin: string): boolean {
  return origin === 'http://localhost:3000' || origin === 'https://localhost:3000'
}

export function getSiteOrigin(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, '')
  if (configured) return configured
  if (typeof window !== 'undefined' && window.location.origin && !isUnusedLocalhost3000(window.location.origin)) {
    return window.location.origin
  }
  return PRODUCTION_SITE_URL
}

export function getAuthRedirectUrl(): string {
  return `${getSiteOrigin()}/auth/callback`
}
