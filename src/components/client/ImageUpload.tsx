import { useRef, useState } from 'react'
import type { ReferenceImage } from '@/types/revision'
import { Button } from '@/components/ui/Button'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

interface ImageUploadProps {
  images: ReferenceImage[]
  onChange: (images: ReferenceImage[]) => void
  onAnnotate?: (imageId: string) => void
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
    reader.readAsDataURL(file)
  })
}

export function ImageUpload({ images, onChange, onAnnotate }: ImageUploadProps) {
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
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="reference-images" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Reference screenshots
        </label>
        <span className="text-xs text-muted-foreground">PNG, JPG, WebP, GIF · 5 MB max</span>
      </div>

      <div
        className="cursor-pointer rounded-[var(--radius-sm)] border border-dashed border-border bg-surface-elevated/80 p-8 text-center transition-all duration-200 hover:border-bamboo/50 hover:bg-sand/30"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          void handleFiles(e.dataTransfer.files)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        <p className="font-display text-lg font-medium text-foreground">Add screenshots</p>
        <p className="mt-1 text-sm text-muted-foreground">Drag files here, or click to browse. You can skip this step.</p>
      </div>

      <input
        ref={inputRef}
        id="reference-images"
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {error ? (
        <p className="text-sm text-status-rejected" role="alert">
          {error}
        </p>
      ) : null}

      {images.length > 0 ? (
        <ul className="grid gap-3">
          {images.map((image) => (
            <li
              key={image.id}
              className="grid gap-3 rounded-[var(--radius-sm)] border border-border bg-surface-elevated p-3 sm:grid-cols-[88px_1fr]"
            >
              <img
                src={image.dataUrl}
                alt={image.name}
                className="h-[88px] w-[88px] rounded-[var(--radius-sm)] object-cover"
              />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-sm font-medium">{image.name}</strong>
                  <span className="text-xs text-muted-foreground">{Math.round(image.sizeBytes / 1024)} KB</span>
                </div>
                <input
                  type="text"
                  value={image.caption}
                  placeholder="Describe what this screenshot shows"
                  aria-label={`Caption for ${image.name}`}
                  className="w-full rounded-[var(--radius-md)] border border-border bg-surface-base px-3 py-2 text-sm focus:border-accent-primary/35 focus:outline-none focus:ring-2 focus:ring-accent-primary/15"
                  onChange={(e) => updateCaption(image.id, e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {onAnnotate ? (
                    <Button variant="secondary" size="sm" onClick={() => onAnnotate(image.id)}>
                      Annotate
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="sm" onClick={() => removeImage(image.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
