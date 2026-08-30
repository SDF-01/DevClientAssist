import { useRef, useState } from 'react'

interface UploadedFile {
  name: string
  dataUrl: string
}

export default function UpdateRequestForm() {
  const [productName, setProductName] = useState('')
  const [requestText, setRequestText] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [downloaded, setDownloaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setUploadedFiles((prev) => [
          ...prev,
          { name: file.name, dataUrl: ev.target?.result as string },
        ])
      }
      reader.readAsDataURL(file)
    })
    // reset so the same file can be re-added after removal
    e.target.value = ''
  }

  function removeFile(index: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function buildToonContent(): string {
    const lines: string[] = [
      '[DevClientAssist Update Request]',
      `Generated: ${new Date().toISOString()}`,
      '',
      `Product: ${productName || '(not specified)'}`,
      '',
      '[Update Request]',
      requestText || '(no description provided)',
      '',
      '[Attachments]',
    ]

    if (uploadedFiles.length === 0) {
      lines.push('None')
    } else {
      uploadedFiles.forEach((f, i) => {
        lines.push(`${i + 1}. ${f.name}`)
        lines.push(f.dataUrl)
        lines.push('')
      })
    }

    return lines.join('\n')
  }

  function handleDownload() {
    const content = buildToonContent()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const safeName = (productName || 'update-request').replace(/\s+/g, '-').toLowerCase()
    a.href = url
    a.download = `${safeName}.toon`
    a.click()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  const canSubmit = requestText.trim().length > 0

  return (
    <div className="form-wrapper">
      <h1>Client Update Request</h1>
      <p className="subtitle">
        Describe the software updates you need. Attach screenshots if helpful.
        Download the result as a <code>.toon</code> instruction file.
      </p>

      <div className="field">
        <label htmlFor="product-name">Product name</label>
        <input
          id="product-name"
          type="text"
          placeholder="e.g. My App v2"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="request-text">Update request *</label>
        <textarea
          id="request-text"
          rows={8}
          placeholder="Describe the changes or new features you want…"
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Screenshots / attachments</label>
        <button
          type="button"
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          + Add files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {uploadedFiles.length > 0 && (
          <ul className="file-list">
            {uploadedFiles.map((f, i) => (
              <li key={i}>
                <img src={f.dataUrl} alt={f.name} className="thumb" />
                <span>{f.name}</span>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${f.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        className="download-btn"
        disabled={!canSubmit}
        onClick={handleDownload}
      >
        {downloaded ? '✓ Downloaded!' : 'Download .toon file'}
      </button>
    </div>
  )
}
