import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stepper } from '@/components/ui/Stepper'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { ImageUpload } from '@/components/client/ImageUpload'
import { ImageAnnotator } from '@/components/client/ImageAnnotator'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { useRevisionDraft } from '@/hooks/useRevisionDraft'
import { listProjects } from '@/lib/data/projects'
import { listRevisions, submitRevision } from '@/lib/data/revisions'
import { formatStructuredPreview, structureRevisionRequest } from '@/lib/revisionParser'
import { calculateCompletenessScore } from '@/lib/completenessScore'
import { detectSimilarRequests } from '@/lib/versioning'
import { listTemplates } from '@/lib/templates'
import { exportRevisionToToon, validateToonStrict } from '@/lib/toonExporter'
import type { Project, RevisionTemplate } from '@/types/database'
import type { ReferenceImage } from '@/types/revision'

const STEPS = ['Write', 'Pictures', 'Review']

export function RevisionWizard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { draft, saveDraft, clearDraft } = useRevisionDraft()

  const [step, setStep] = useState(0)
  const [projects, setProjects] = useState<Project[]>([])
  const [templates, setTemplates] = useState<RevisionTemplate[]>([])
  const [projectId, setProjectId] = useState('')
  const [rawRequest, setRawRequest] = useState('')
  const [images, setImages] = useState<ReferenceImage[]>([])
  const [contactName, setContactName] = useState('')
  const [urgency, setUrgency] = useState('medium')
  const [clientNotes, setClientNotes] = useState('')
  const [annotatingId, setAnnotatingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [similarWarning, setSimilarWarning] = useState<string | null>(null)
  const [showToon, setShowToon] = useState(false)

  useEffect(() => {
    void listProjects().then((loaded) => {
      setProjects(loaded)
      if (loaded.length === 1) setProjectId(loaded[0].id)
    })
    void listTemplates().then(setTemplates)
  }, [])

  useEffect(() => {
    if (draft) {
      setProjectId(draft.projectId)
      setRawRequest(draft.rawRequest)
      setContactName(draft.contactName)
      setUrgency(draft.urgency)
      setClientNotes(draft.clientNotes)
      setImages(draft.images)
    }
  }, [draft])

  const selectedProject = projects.find((p) => p.id === projectId)
  const wordCount = useMemo(() => rawRequest.trim().split(/\s+/).filter(Boolean).length, [rawRequest])

  const preview = useMemo(() => {
    if (!rawRequest.trim()) return null
    if (!selectedProject) {
      return {
        formatted: rawRequest.trim(),
        toon: '',
        completeness: {
          score: 20,
          warnings: ['The app should appear here. Refresh if it is missing.'],
          suggestions: [] as string[],
        },
      }
    }
    try {
      const structured = structureRevisionRequest(selectedProject.slug, rawRequest, images)
      const completeness = calculateCompletenessScore(rawRequest, images, structured)
      let toon = ''
      try {
        const exported = exportRevisionToToon(structured, images)
        validateToonStrict(exported.toon)
        toon = exported.toon
      } catch {
        toon = ''
      }
      return { completeness, toon, formatted: formatStructuredPreview(structured) }
    } catch {
      return {
        formatted: rawRequest.trim(),
        toon: '',
        completeness: {
          score: 30,
          warnings: ['We will tidy this into a brief after you send it.'],
          suggestions: [] as string[],
        },
      }
    }
  }, [selectedProject, rawRequest, images])

  function reviewHint() {
    if (!preview) return ''
    if (preview.completeness.score >= 80) return 'This looks ready to send.'
    if (preview.completeness.warnings[0]) return preview.completeness.warnings[0]
    if (preview.completeness.suggestions[0]) return preview.completeness.suggestions[0]
    return 'You can send this now, or go back to add more.'
  }

  useEffect(() => {
    if (!rawRequest.trim()) {
      setSimilarWarning(null)
      return
    }
    void listRevisions().then((existing) => {
      const similar = detectSimilarRequests(rawRequest, existing)
      if (similar.length > 0) {
        setSimilarWarning(`This looks close to a recent request: "${similar[0].title}".`)
      } else {
        setSimilarWarning(null)
      }
    })
  }, [rawRequest])

  function handleSaveDraft() {
    saveDraft({ projectId, rawRequest, contactName, urgency, clientNotes, images })
    showToast('Draft saved on this device.', 'success')
  }

  async function handleSubmit(asDraft = false) {
    if (!projectId || !rawRequest.trim()) {
      showToast('Write what should change before sending.', 'error')
      return
    }

    setSubmitting(true)
    try {
      const revision = await submitRevision({
        projectId,
        rawRequest,
        images,
        contactName: contactName || user?.full_name,
        contactEmail: user?.email,
        urgency: urgency as 'low' | 'medium' | 'high' | 'critical',
        clientNotes,
        userId: user?.id ?? null,
        asDraft,
      })
      clearDraft()
      showToast(asDraft ? 'Draft saved.' : 'Request sent.', 'success')
      navigate(`/requests/${revision.id}`)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not send the request.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  function applyTemplate(template: RevisionTemplate) {
    setRawRequest(template.template_text)
    showToast(`Started from ${template.name}.`, 'info')
  }

  function handleAnnotateSave(dataUrl: string) {
    if (!annotatingId) return
    setImages((current) =>
      current.map((img) =>
        img.id === annotatingId ? { ...img, dataUrl, annotationData: dataUrl } : img,
      ),
    )
    setAnnotatingId(null)
  }

  const canContinueWrite = Boolean(projectId && rawRequest.trim())

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <p className="section-label">New request</p>
        <h1 className="font-display text-3xl font-normal sm:text-4xl">What should we change?</h1>
        {selectedProject ? <p className="app-chip">{selectedProject.name}</p> : null}
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Add your name if you like, then describe the change in your own words.
        </p>
        <Stepper steps={STEPS} currentStep={step} />
      </header>

      {step === 0 ? (
        <Card framed className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Your name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Optional"
            />
            <Select
              label="How urgent is this?"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
          </div>
          {templates.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Start from</p>
              <div className="flex flex-wrap gap-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="rounded-[var(--radius-sm)] border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium tracking-wide text-foreground transition-colors hover:border-bamboo/40 hover:bg-blush/30"
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <Textarea
            label="The change"
            hint={`${wordCount} words`}
            value={rawRequest}
            onChange={(e) => setRawRequest(e.target.value)}
            placeholder={'Example:\n- Move the primary button higher on the page\n- Match the color in the screenshot\n- Leave login as it is'}
            rows={12}
          />
          {similarWarning ? (
            <p className="text-sm text-terracotta" role="status">
              {similarWarning}
            </p>
          ) : null}
          <Textarea
            label="Anything else? (optional)"
            value={clientNotes}
            onChange={(e) => setClientNotes(e.target.value)}
            rows={3}
          />
        </Card>
      ) : null}

      {step === 1 ? (
        <Card framed>
          <CardHeader>
            <CardTitle className="text-2xl font-normal">Pictures help, but they are optional</CardTitle>
            <CardDescription>Drop screenshots if they show the issue. Otherwise continue to review.</CardDescription>
          </CardHeader>
          <ImageUpload images={images} onChange={setImages} onAnnotate={setAnnotatingId} />
        </Card>
      ) : null}

      {step === 2 && preview ? (
        <Card framed className="space-y-4">
          <CardHeader>
            <CardTitle className="text-2xl font-normal">Does this look right?</CardTitle>
            <CardDescription>
              This is the brief the team will see. You can go back and edit, or send it now.
            </CardDescription>
          </CardHeader>
          <p className="text-sm text-moss">{reviewHint()}</p>
          <pre className="code-block-light max-h-72 overflow-auto rounded-[var(--radius-sm)] p-4 text-xs whitespace-pre-wrap font-mono">
            {preview.formatted}
          </pre>
          {preview.toon ? (
            <>
              <button
                type="button"
                className="text-sm text-[#606c5a] underline-offset-4 hover:underline"
                onClick={() => setShowToon((open) => !open)}
              >
                {showToon ? 'Hide technical export' : 'Show technical export'}
              </button>
              {showToon ? (
                <pre className="code-block-dark max-h-48 overflow-auto rounded-[var(--radius-sm)] p-4 text-xs whitespace-pre-wrap font-mono">
                  {preview.toon}
                </pre>
              ) : null}
            </>
          ) : null}
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {step > 0 ? (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : null}
        {step === 0 ? (
          <Button onClick={() => setStep(1)} disabled={!canContinueWrite}>
            Continue
          </Button>
        ) : null}
        {step === 1 ? (
          <>
            <Button onClick={() => setStep(2)} disabled={!preview}>
              Continue to review
            </Button>
            {images.length === 0 ? (
              <Button variant="ghost" onClick={() => setStep(2)} disabled={!preview}>
                Continue without pictures
              </Button>
            ) : null}
          </>
        ) : null}
        {step === 2 ? (
          <Button onClick={() => void handleSubmit(false)} disabled={submitting || !preview}>
            Send request
          </Button>
        ) : null}
        <Button variant="ghost" onClick={handleSaveDraft}>
          Save draft
        </Button>
      </div>

      {annotatingId ? (
        <ImageAnnotator
          imageUrl={images.find((i) => i.id === annotatingId)?.dataUrl ?? ''}
          imageName={images.find((i) => i.id === annotatingId)?.name ?? 'Image'}
          initialAnnotation={images.find((i) => i.id === annotatingId)?.annotationData}
          onSave={handleAnnotateSave}
          onClose={() => setAnnotatingId(null)}
        />
      ) : null}
    </div>
  )
}
