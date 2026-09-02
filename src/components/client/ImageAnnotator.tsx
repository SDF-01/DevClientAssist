import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'

interface ImageAnnotatorProps {
  imageUrl: string
  imageName: string
  initialAnnotation?: string | null
  onSave: (annotationDataUrl: string) => void
  onClose: () => void
}

export function ImageAnnotator({ imageUrl, imageName, initialAnnotation, onSave, onClose }: ImageAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      if (initialAnnotation) {
        const overlay = new Image()
        overlay.onload = () => ctx.drawImage(overlay, 0, 0)
        overlay.src = initialAnnotation
      }
    }
    img.src = imageUrl
  }, [imageUrl, initialAnnotation])

  function startDraw(e: React.MouseEvent<HTMLCanvasElement>) {
    setDrawing(true)
    draw(e)
  }

  function endDraw() {
    setDrawing(false)
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing && e.type === 'mousemove') return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    ctx.strokeStyle = '#8B9A7D'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function handleSave() {
    const canvas = canvasRef.current
    if (!canvas) return
    onSave(canvas.toDataURL('image/png'))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-japa-ink/40 p-4 backdrop-blur-sm">
      <Card className="max-h-[90vh] w-full max-w-4xl overflow-auto bg-surface-elevated shadow-lift">
        <CardHeader>
          <p className="japandi-kicker">Annotate</p>
          <CardTitle className="font-normal">{imageName}</CardTitle>
        </CardHeader>
      <div className="overflow-auto rounded-[var(--radius-md)] border border-border">
        <canvas
          ref={canvasRef}
          className="max-h-[60vh] w-full cursor-crosshair"
          onMouseDown={startDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onMouseMove={draw}
        />
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={handleSave}>Save Annotation</Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Card>
    </div>
  )
}
