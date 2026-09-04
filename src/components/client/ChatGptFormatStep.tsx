import { useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Input'
import { isAcceptableToonFile, isLikelyToonContent, normalizePastedToon } from '@/lib/chatgptBrief'
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

    const reader = new FileReader()
    reader.onload = () => {
      const contents = normalizePastedToon(String(reader.result ?? ''))
      if (!isLikelyToonContent(contents) && !isAcceptableToonFile(file)) {
        showToast('That file is not a .toon brief. Paste the text ChatGPT gave you instead.', 'error')
        return
      }
      if (!contents) {
        showToast('That file was empty. Paste the .toon text below instead.', 'error')
        return
      }
      onFormattedBriefChange(contents)
      showToast('Loaded the .toon file.', 'success')
    }
    reader.onerror = () => {
      showToast('Could not read that file. Paste the .toon text below instead.', 'error')
    }
    reader.readAsText(file)
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <Card framed className="space-y-4">
        <CardHeader>
          <p className="section-label">Step 1 of this screen</p>
          <CardTitle className="text-2xl font-normal">Copy this into ChatGPT</CardTitle>
          <CardDescription>
            Your notes are already inside this prompt. ChatGPT should create a downloadable .toon file, not a written
            brief. Paste the whole block into ChatGPT, then come back here with the file.
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
          <CardTitle className="text-2xl font-normal">Paste the .toon file</CardTitle>
          <CardDescription>
            If ChatGPT cannot attach a file, paste the .toon text here. You do not have to upload a file.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            id="toon-file-upload"
            type="file"
            accept=".toon,.txt,.md,text/plain,text/markdown,application/octet-stream"
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
