import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { copyToClipboard } from '@/lib/toonExporter'
import { useToast } from '@/components/ui/Toast'

interface LiveToonPanelProps {
  formatted: string
  toon: string
  engine: 'local-rewrite' | 'llm-rewrite'
  isRewriting: boolean
  empty?: boolean
}

export function LiveToonPanel({ formatted, toon, engine, isRewriting, empty = false }: LiveToonPanelProps) {
  const { showToast } = useToast()

  async function handleCopy() {
    if (!toon) return
    await copyToClipboard(toon)
    showToast('.toon copied.', 'success')
  }

  return (
    <Card framed className="space-y-4 xl:sticky xl:top-24">
      <CardHeader>
        <p className="section-label">Live .toon engine</p>
        <CardTitle className="text-2xl font-normal">Rewritten brief</CardTitle>
        <CardDescription>
          {empty
            ? 'Start writing. The engine will rewrite your notes into an agent-ready .toon file.'
            : isRewriting
              ? 'Rewriting as you type...'
              : engine === 'llm-rewrite'
                ? 'Model rewrite is live. This is what the build agent should follow.'
                : 'Local rewrite is live. This is what the build agent should follow.'}
        </CardDescription>
      </CardHeader>

      {empty ? (
        <p className="text-sm text-muted-foreground">Waiting for a change to compile.</p>
      ) : (
        <>
          <pre className="code-block-light max-h-56 overflow-auto rounded-[var(--radius-sm)] p-4 text-xs whitespace-pre-wrap font-mono">
            {formatted}
          </pre>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Generated .toon</p>
            <Button variant="secondary" size="sm" onClick={() => void handleCopy()} disabled={!toon}>
              Copy .toon
            </Button>
          </div>
          <pre className="code-block-dark max-h-64 overflow-auto rounded-[var(--radius-sm)] p-4 text-xs whitespace-pre-wrap font-mono">
            {toon || 'TOON will appear here once the brief compiles.'}
          </pre>
        </>
      )}
    </Card>
  )
}
