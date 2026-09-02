const ANALYTICS_KEY = 'revision-portal-analytics'

interface AnalyticsEvent {
  name: string
  payload: Record<string, unknown>
  timestamp: string
}

export function logAnalyticsEvent(name: string, payload: Record<string, unknown> = {}) {
  if (import.meta.env.VITE_ANALYTICS_ENABLED !== 'true') {
    const events = getAnalyticsEvents()
    events.push({ name, payload, timestamp: new Date().toISOString() })
    if (events.length > 500) events.shift()
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events))
    return
  }

  // Hook for Plausible/PostHog when configured
  const windowWithAnalytics = window as Window & {
    plausible?: (event: string, options?: { props: Record<string, unknown> }) => void
  }
  windowWithAnalytics.plausible?.(name, { props: payload })
}

export function getAnalyticsEvents(): AnalyticsEvent[] {
  const raw = localStorage.getItem(ANALYTICS_KEY)
  return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : []
}

export function getAnalyticsSummary() {
  const events = getAnalyticsEvents()
  const counts: Record<string, number> = {}
  for (const event of events) {
    counts[event.name] = (counts[event.name] ?? 0) + 1
  }
  return { totalEvents: events.length, counts, recent: events.slice(-20).reverse() }
}
