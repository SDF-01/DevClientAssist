import { useMemo, useState } from 'react'
import { AppSelector } from './AppSelector'
import { ImageUpload } from './ImageUpload'
import { formatStructuredPreview, structureRevisionRequest } from '../lib/revisionParser'
import { copyToClipboard, downloadToonFile, exportRevisionToToon } from '../lib/toonExporter'
import type { ReferenceImage } from '../types/revision'

export function RevisionForm() {
  const [appId, setAppId] = useState('')
  const [rawRequest, setRawRequest] = useState('')
  const [images, setImages] = useState<ReferenceImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [generatedToon, setGeneratedToon] = useState<string | null>(null)
  const [formattedPreview, setFormattedPreview] = useState<string | null>(null)
  const [filename, setFilename] = useState<string | null>(null)

  const wordCount = useMemo(
    () => rawRequest.trim().split(/\s+/).filter(Boolean).length,
    [rawRequest],
  )

  function handleGenerate() {
    setError(null)
    setStatusMessage(null)

    try {
      if (!appId) {
        throw new Error('Select the application this revision applies to.')
      }

      if (!rawRequest.trim()) {
        throw new Error('Enter the revision details before generating.')
      }

      const structured = structureRevisionRequest(appId, rawRequest, images)
      const result = exportRevisionToToon(structured, images)

      setGeneratedToon(result.toon)
      setFormattedPreview(formatStructuredPreview(structured))
      setFilename(result.filename)
      setStatusMessage('Revision request converted to TOON successfully.')
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Unable to generate TOON file.'
      setError(message)
      setGeneratedToon(null)
      setFormattedPreview(null)
      setFilename(null)
    }
  }

  async function handleCopy() {
    if (!generatedToon) return
    await copyToClipboard(generatedToon)
    setStatusMessage('TOON content copied to clipboard.')
  }

  function handleDownload() {
    if (!generatedToon || !filename) return
    downloadToonFile(generatedToon, filename)
    setStatusMessage(`Downloaded ${filename}.`)
  }

  function handleReset() {
    setAppId('')
    setRawRequest('')
    setImages([])
    setError(null)
    setStatusMessage(null)
    setGeneratedToon(null)
    setFormattedPreview(null)
    setFilename(null)
  }

  return (
    <div className="layout">
      <section className="panel form-panel">
        <header className="panel-header">
          <p className="eyebrow">Client revision intake</p>
          <h1>Turn revision notes into agent-ready TOON</h1>
          <p className="lede">
            Select the target app, attach reference screenshots, and describe the changes. The app rewrites your
            request into structured instructions and exports a `.toon` file for development agents.
          </p>
        </header>

        <AppSelector value={appId} onChange={setAppId} />

        <section className="field-group">
          <div className="field-header">
            <label htmlFor="revision-request">Revision request</label>
            <span className="field-hint">{wordCount} words</span>
          </div>
          <textarea
            id="revision-request"
            value={rawRequest}
            onChange={(event) => setRawRequest(event.target.value)}
            placeholder={'Example:\n- Move the primary CTA above the fold on the dashboard\n- Match the button color to the attached screenshot\n- Keep existing auth flow unchanged'}
            rows={12}
            required
          />
          <p className="field-description">
            Use bullets or paragraphs. The parser will categorize items, assign priority, and build acceptance criteria.
          </p>
        </section>

        <ImageUpload images={images} onChange={setImages} />

        <div className="action-row">
          <button type="button" className="primary-button" onClick={handleGenerate}>
            Generate TOON
          </button>
          <button type="button" className="secondary-button" onClick={handleReset}>
            Reset form
          </button>
        </div>

        {error ? <p className="banner error">{error}</p> : null}
        {statusMessage ? <p className="banner success">{statusMessage}</p> : null}
      </section>

      <section className="panel output-panel">
        <header className="panel-header">
          <p className="eyebrow">Output</p>
          <h2>Structured instructions and TOON export</h2>
        </header>

        {!generatedToon ? (
          <div className="empty-state">
            <p>Generated instructions and the `.toon` file will appear here after you submit a revision request.</p>
          </div>
        ) : (
          <>
            <div className="output-actions">
              <button type="button" className="primary-button" onClick={handleDownload}>
                Download .toon
              </button>
              <button type="button" className="secondary-button" onClick={() => void handleCopy()}>
                Copy TOON
              </button>
            </div>

            <section className="output-block">
              <h3>Formatted instructions</h3>
              <pre className="code-block preview-block">{formattedPreview}</pre>
            </section>

            <section className="output-block">
              <h3>TOON file preview</h3>
              <pre className="code-block toon-block">{generatedToon}</pre>
            </section>
          </>
        )}
      </section>
    </div>
  )
}
