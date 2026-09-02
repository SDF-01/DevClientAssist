import { useEffect, useMemo, useState } from 'react'
import type { Project } from '@/types/database'
import type { ReferenceImage, RevisionPriority } from '@/types/revision'
import { structureRevisionWithIntelligence } from '@/lib/structureRevision'
import { compileLocalToon, type ToonEngineResult } from '@/lib/toonEngine'
import { exportRevisionToToon, validateToonStrict } from '@/lib/toonExporter'
import { formatStructuredPreview } from '@/lib/revisionParser'
import { calculateCompletenessScore } from '@/lib/completenessScore'

interface UseLiveToonEngineInput {
  project: Project | undefined
  rawRequest: string
  images: ReferenceImage[]
  urgency: string
  clientNotes: string
}

export function useLiveToonEngine({
  project,
  rawRequest,
  images,
  urgency,
  clientNotes,
}: UseLiveToonEngineInput): {
  preview: ToonEngineResult | null
  isRewriting: boolean
} {
  const localPreview = useMemo(() => {
    if (!project || !rawRequest.trim()) return null
    try {
      return compileLocalToon({
        appId: project.slug,
        rawRequest,
        images,
        urgency: urgency as RevisionPriority,
        clientNotes,
      })
    } catch {
      return null
    }
  }, [project, rawRequest, images, urgency, clientNotes])

  const [preview, setPreview] = useState<ToonEngineResult | null>(null)
  const [isRewriting, setIsRewriting] = useState(false)

  useEffect(() => {
    setPreview(localPreview)
  }, [localPreview])

  useEffect(() => {
    if (!project || !rawRequest.trim() || !localPreview) {
      setIsRewriting(false)
      return
    }

    setIsRewriting(true)
    const handle = window.setTimeout(() => {
      void structureRevisionWithIntelligence(
        project.slug,
        project.name,
        project.description,
        rawRequest,
        images,
        { urgency: urgency as RevisionPriority, clientNotes },
      )
        .then((structured) => {
          if (structured.meta.engine !== 'llm-rewrite') {
            setIsRewriting(false)
            return
          }
          const exported = exportRevisionToToon(structured, images)
          validateToonStrict(exported.toon)
          setPreview({
            structured,
            formatted: formatStructuredPreview(structured),
            toon: exported.toon,
            completeness: calculateCompletenessScore(rawRequest, images, structured),
            engine: 'llm-rewrite',
          })
          setIsRewriting(false)
        })
        .catch(() => {
          setIsRewriting(false)
        })
    }, 450)

    return () => window.clearTimeout(handle)
  }, [project, rawRequest, images, urgency, clientNotes, localPreview])

  return { preview, isRewriting }
}
