import { useCallback, useEffect, useState } from 'react'
import type { ReferenceImage } from '@/types/revision'

const DRAFT_KEY = 'revision-portal-draft'

export interface RevisionDraft {
  projectId: string
  rawRequest: string
  contactName: string
  urgency: string
  clientNotes: string
  images: ReferenceImage[]
  savedAt: string
}

export function useRevisionDraft() {
  const [draft, setDraft] = useState<RevisionDraft | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) setDraft(JSON.parse(raw) as RevisionDraft)
  }, [])

  const saveDraft = useCallback((next: Omit<RevisionDraft, 'savedAt'>) => {
    const record: RevisionDraft = { ...next, savedAt: new Date().toISOString() }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(record))
    setDraft(record)
  }, [])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    setDraft(null)
  }, [])

  return { draft, saveDraft, clearDraft }
}
