import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Input'
import { copyToClipboard } from '@/lib/toonExporter'
import { useToast } from '@/components/ui/Toast'

interface ChatGptFormatStepProps {
  prompt: string
  formattedBrief: string
  onFormattedBriefChange: (value: string) => void
}

export function ChatGptFormatStep({ prompt, formattedBrief, onFormattedBriefChange }: ChatGptFormatStepProps) {
  const { showToast } = useToast()

  async function handleCopy() {
    await copyToClipboard(prompt)
    showToast('Prompt copied. Paste it into ChatGPT.', 'success')
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <Card framed className="space-y-4">
        <CardHeader>
          <p className="section-label">Step 1 of this screen</p>
          <CardTitle className="text-2xl font-normal">Copy this into ChatGPT</CardTitle>
          <CardDescription>
            Your notes are already inside this prompt. Paste the whole block into ChatGPT, then come back here with the
            reply.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void handleCopy()}>
            Copy prompt
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.open('https://chatgpt.com/', '_blank', 'noopener,noreferrer')}
          >
            Open ChatGPT
          </Button>
        </div>
        <pre className="code-block-light max-h-80 overflow-auto rounded-[var(--radius-sm)] p-4 text-xs whitespace-pre-wrap font-mono">
          {prompt}
        </pre>
      </Card>

      <Card framed className="space-y-4">
        <CardHeader>
          <p className="section-label">Step 2 of this screen</p>
          <CardTitle className="text-2xl font-normal">Paste the ChatGPT reply</CardTitle>
          <CardDescription>
            Paste the formatted brief here. This is what the developer will receive.
          </CardDescription>
        </CardHeader>
        <Textarea
          label="Formatted brief"
          value={formattedBrief}
          onChange={(event) => onFormattedBriefChange(event.target.value)}
          placeholder="Paste the ChatGPT answer here."
          rows={16}
        />
      </Card>
    </div>
  )
}
