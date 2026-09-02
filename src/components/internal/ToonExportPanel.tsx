import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { exportRevision } from '@/lib/data/revisions'
import { downloadTextFile, exportToJson, exportToMarkdown } from '@/lib/toonExporter'
import { buildCursorAgentBundle, buildGitHubWebhookPayload, triggerGitHubWebhook } from '@/lib/integrations/github'
import { exportJiraTickets } from '@/lib/integrations/jira'
import { exportLinearTickets } from '@/lib/integrations/linear'
import type { RevisionRequestWithRelations } from '@/types/database'
import type { StructuredRevisionRequest } from '@/types/revision'
import { useToast } from '@/components/ui/Toast'

interface ToonExportPanelProps {
  revision: RevisionRequestWithRelations
  actorId: string | null
  onExported: () => void
}

export function ToonExportPanel({ revision, actorId, onExported }: ToonExportPanelProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const structured = revision.structured_payload as unknown as StructuredRevisionRequest

  async function handleExportToon() {
    setLoading(true)
    try {
      const record = await exportRevision(revision.id, actorId)
      if (record.content) {
        downloadTextFile(record.content, record.file_name, 'text/toon')
      }
      showToast('TOON exported successfully.', 'success')
      onExported()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Export failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleExportMarkdown() {
    const md = exportToMarkdown(structured)
    downloadTextFile(md, `revision-${revision.id.slice(0, 8)}.md`, 'text/markdown')
  }

  function handleExportJson() {
    const json = exportToJson(structured)
    downloadTextFile(json, `revision-${revision.id.slice(0, 8)}.json`, 'application/json')
  }

  function handleExportLinear() {
    downloadTextFile(exportLinearTickets(revision), `linear-${revision.id.slice(0, 8)}.json`, 'application/json')
  }

  function handleExportJira() {
    downloadTextFile(exportJiraTickets(revision), `jira-${revision.id.slice(0, 8)}.json`, 'application/json')
  }

  async function handleTriggerWebhook() {
    const record = await exportRevision(revision.id, actorId)
    if (!record.content) return
    const payload = buildGitHubWebhookPayload(revision, record.content)
    const ok = await triggerGitHubWebhook(payload)
    showToast(ok ? 'Webhook triggered.' : 'Webhook URL not configured.', ok ? 'success' : 'info')
  }

  function handleCursorBundle() {
    const bundle = buildCursorAgentBundle(revision, exportToJson(structured))
    downloadTextFile(JSON.stringify(bundle, null, 2), `cursor-bundle-${revision.id.slice(0, 8)}.json`, 'application/json')
  }

  const canExport = ['approved', 'exported', 'in_progress', 'done', 'submitted'].includes(revision.status)

  return (
    <Card>
      <CardHeader>
        <p className="section-label">Output</p>
        <CardTitle className="font-normal">Export and integrations</CardTitle>
      </CardHeader>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void handleExportToon()} disabled={loading || !canExport}>
          Export TOON
        </Button>
        <Button variant="secondary" onClick={handleExportMarkdown}>
          Markdown
        </Button>
        <Button variant="secondary" onClick={handleExportJson}>
          JSON
        </Button>
        <Button variant="secondary" onClick={handleExportLinear}>
          Linear Stubs
        </Button>
        <Button variant="secondary" onClick={handleExportJira}>
          Jira Stubs
        </Button>
        <Button variant="secondary" onClick={() => void handleTriggerWebhook()}>
          GitHub Webhook
        </Button>
        <Button variant="secondary" onClick={handleCursorBundle}>
          Cursor Bundle
        </Button>
      </div>
    </Card>
  )
}
