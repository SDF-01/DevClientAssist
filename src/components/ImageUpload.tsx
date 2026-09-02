import { useRef, useState } from 'react'
import type { ReferenceImage } from '../types/revision'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

interface ImageUploadProps {
  images: ReferenceImage[]
  onChange: (images: ReferenceImage[]) => void
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
    reader.readAsDataURL(file)
  })
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return

    setError(null)
    const nextImages = [...images]

    for (const file of Array.from(fileList)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`${file.name} is not a supported image type.`)
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} exceeds the 5 MB limit.`)
        continue
      }

      const dataUrl = await readFileAsDataUrl(file)
      nextImages.push({
        id: crypto.randomUUID(),
        name: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        caption: '',
        dataUrl,
      })
    }

    onChange(nextImages)
  }

  function updateCaption(id: string, caption: string) {
    onChange(images.map((image) => (image.id === id ? { ...image, caption } : image)))
  }

  function removeImage(id: string) {
    onChange(images.filter((image) => image.id !== id))
  }

  return (
    <section className="field-group">
      <div className="field-header">
        <label htmlFor="reference-images">Reference screenshots</label>
        <span className="field-hint">PNG, JPG, WebP, or GIF up to 5 MB each</span>
      </div>

      <div
        className="upload-dropzone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          event.currentTarget.classList.add('drag-over')
        }}
        onDragLeave={(event) => {
          event.currentTarget.classList.remove('drag-over')
        }}
        onDrop={(event) => {
          event.preventDefault()
          event.currentTarget.classList.remove('drag-over')
          void handleFiles(event.dataTransfer.files)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        <p className="upload-title">Drop images here or click to browse</p>
        <p className="upload-subtitle">Attach mockups, screenshots, or visual references for the revision.</p>
      </div>

      <input
        ref={inputRef}
        id="reference-images"
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        hidden
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {error ? <p className="field-error">{error}</p> : null}

      {images.length > 0 ? (
        <ul className="image-list">
          {images.map((image) => (
            <li key={image.id} className="image-card">
              <img src={image.dataUrl} alt={image.name} className="image-preview" />
              <div className="image-meta">
                <strong>{image.name}</strong>
                <span>{Math.round(image.sizeBytes / 1024)} KB</span>
                <input
                  type="text"
                  value={image.caption}
                  placeholder="Describe what this screenshot shows"
                  onChange={(event) => updateCaption(image.id, event.target.value)}
                />
                <button type="button" className="ghost-button" onClick={() => removeImage(image.id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
