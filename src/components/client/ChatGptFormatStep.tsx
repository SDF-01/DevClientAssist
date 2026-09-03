import { useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Input'
import { normalizePastedToon } from '@/lib/chatgptBrief'
import { copyToClipboard } from '@/lib/toonExporter'
import { useToast } from '@/components/ui/Toast'

interface ChatGptFormatStepProps {
  prompt: string
  formattedBrief: string
  onFormattedBriefChange: (value: string) => void
}

export function ChatGptFormatStep({ prompt, formattedBrief, onFormattedBriefChange }: ChatGptFormatStepProps) {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleCopy() {
    await copyToClipboard(prompt)
    showToast('Prompt copied. Paste it into ChatGPT so it can create a .toon file.', 'success')
  }

  function handleToonFile(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return

    const name = file.name.toLowerCase()
    const isToon = name.endsWith('.toon') || file.type === 'text/toon' || file.type === 'text/plain'
    if (!isToon) {
      showToast('Choose a .toon file from ChatGPT.', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      onFormattedBriefChange(normalizePastedToon(String(reader.result ?? '')))
      showToast('Loaded the .toon file.', 'success')
    }
    reader.onerror = () => {
      showToast('Could not read that .toon file.', 'error')
    }
    reader.readAsText(file)
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <Card framed className="space-y-4">
        <CardHeader className="text-center">
          <p className="section-label">Step 1 of this screen</p>
          <CardTitle className="text-2xl font-normal">Copy this into ChatGPT</CardTitle>
          <CardDescription>
            Your notes are already inside this prompt. ChatGPT should create a downloadable .toon file, not a written
            brief. Paste the whole block into ChatGPT, then come back here with the file.
          </CardDescription>
        </CardHeader>
        <div className="page-actions">
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
        <CardHeader className="text-center">
          <p className="section-label">Step 2 of this screen</p>
          <CardTitle className="text-2xl font-normal">Paste the .toon file</CardTitle>
          <CardDescription>
            Upload the .toon file ChatGPT created, or paste its contents. This is what the developer will receive.
          </CardDescription>
        </CardHeader>
        <div className="page-actions">
          <input
            ref={fileInputRef}
            id="toon-file-upload"
            type="file"
            accept=".toon,text/toon,text/plain"
            hidden
            onChange={(event) => {
              handleToonFile(event.target.files)
              event.target.value = ''
            }}
          />
          <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Upload .toon file
          </Button>
        </div>
        <Textarea
          label=".toon file"
          value={formattedBrief}
          onChange={(event) => onFormattedBriefChange(event.target.value)}
          onBlur={() => onFormattedBriefChange(normalizePastedToon(formattedBrief))}
          placeholder="Paste the .toon file contents here."
          rows={16}
        />
      </Card>
    </div>
  )
}
