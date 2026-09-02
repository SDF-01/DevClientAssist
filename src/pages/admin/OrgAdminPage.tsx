import { useEffect, useState } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { listProjects } from '@/lib/data/projects'
import { getAnalyticsSummary } from '@/lib/analytics'
import { getRetentionPolicy, runRetentionPolicy, setRetentionPolicy } from '@/lib/retention'
import type { Project } from '@/types/database'

export function OrgAdminPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [retentionDays, setRetentionDays] = useState(getRetentionPolicy().retentionDays)
  const analytics = getAnalyticsSummary()

  useEffect(() => {
    void listProjects().then(setProjects)
  }, [])

  function handleRetentionSave() {
    setRetentionPolicy({ retentionDays, purgeDoneOnly: true })
    const purged = runRetentionPolicy({ retentionDays, purgeDoneOnly: true })
    alert(`Saved. Removed ${purged} finished request(s) that were older than the limit.`)
  }

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <p className="section-label">Workspace</p>
        <h1 className="font-display text-3xl font-normal">Organization</h1>
      </CardHeader>

      <Card>
        <p className="section-label mb-2">Projects</p>
        <h3 className="mb-3 font-display text-lg font-medium">Active projects</h3>
        <ul className="space-y-2 text-sm">
          {projects.map((project) => (
            <li key={project.id} className="flex justify-between border-b border-border/50 py-2">
              <span className="font-medium">{project.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{project.slug}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <p className="section-label mb-2">Metrics</p>
        <h3 className="mb-3 font-display text-lg font-medium">Analytics summary</h3>
        <p className="text-sm text-muted-foreground">Total events: {analytics.totalEvents}</p>
        <ul className="mt-2 space-y-1 text-sm">
          {Object.entries(analytics.counts).map(([name, count]) => (
            <li key={name} className="flex justify-between border-b border-border/30 py-1">
              <span className="text-muted-foreground">{name}</span>
              <span className="font-medium">{count}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <p className="section-label mb-2">Data</p>
        <h3 className="mb-3 font-display text-lg font-medium">Retention policy</h3>
        <Input
          label="Keep finished requests for (days)"
          type="number"
          value={retentionDays}
          onChange={(e) => setRetentionDays(Number(e.target.value))}
        />
        <Button className="mt-3" onClick={handleRetentionSave}>
          Save and clean old requests
        </Button>
      </Card>

      <Card>
        <p className="section-label mb-2">Connect</p>
        <h3 className="mb-3 font-display text-lg font-medium">Integration config</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Set VITE_GITHUB_WEBHOOK_URL, VITE_SUPABASE_URL, and VITE_SUPABASE_ANON_KEY in your environment.
        </p>
      </Card>
    </div>
  )
}
