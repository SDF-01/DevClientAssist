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
import { LabelBadge } from '@/components/ui/Badge'

const STEPS = ['Project', 'Describe', 'References', 'Preview']

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
  const [contactEmail, setContactEmail] = useState('')
  const [urgency, setUrgency] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [clientNotes, setClientNotes] = useState('')
  const [annotatingId, setAnnotatingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [similarWarning, setSimilarWarning] = useState<string | null>(null)

  useEffect(() => {
    void listProjects().then((loaded) => {
      setProjects(loaded)
      if (loaded.length === 1 && !projectId) {
        setProjectId(loaded[0].id)
      }
    })
    void listTemplates().then(setTemplates)
  }, [])

  useEffect(() => {
    if (draft) {
      setProjectId(draft.projectId)
      setRawRequest(draft.rawRequest)
      setContactName(draft.contactName)
      setContactEmail(draft.contactEmail)
      setUrgency(draft.urgency)
      setDueDate(draft.dueDate)
      setClientNotes(draft.clientNotes)
      setImages(draft.images)
    }
  }, [draft])

  const selectedProject = projects.find((p) => p.id === projectId)
  const wordCount = useMemo(() => rawRequest.trim().split(/\s+/).filter(Boolean).length, [rawRequest])

  const preview = useMemo(() => {
    if (!selectedProject || !rawRequest.trim()) return null
    try {
      const structured = structureRevisionRequest(selectedProject.slug, rawRequest, images)
      const completeness = calculateCompletenessScore(rawRequest, images, structured)
      const toon = exportRevisionToToon(structured, images)
      validateToonStrict(toon.toon)
      return { structured, completeness, toon: toon.toon, formatted: formatStructuredPreview(structured) }
    } catch {
      return null
    }
  }, [selectedProject, rawRequest, images])

  useEffect(() => {
    if (!rawRequest.trim()) {
      setSimilarWarning(null)
      return
    }
    void listRevisions().then((existing) => {
      const similar = detectSimilarRequests(rawRequest, existing)
      if (similar.length > 0) {
        setSimilarWarning(`Similar request found: "${similar[0].title}" submitted recently.`)
      } else {
        setSimilarWarning(null)
      }
    })
  }, [rawRequest])

  function handleSaveDraft() {
    saveDraft({ projectId, rawRequest, contactName, contactEmail, urgency, dueDate, clientNotes, images })
    showToast('Draft saved locally.', 'success')
  }

  async function handleSubmit(asDraft = false) {
    if (!projectId || !rawRequest.trim()) {
      showToast('Complete required fields before submitting.', 'error')
      return
    }

    setSubmitting(true)
    try {
      const revision = await submitRevision({
        projectId,
        rawRequest,
        images,
        contactName: contactName || user?.full_name,
        contactEmail: contactEmail || user?.email,
        urgency: urgency as 'low' | 'medium' | 'high' | 'critical',
        dueDate: dueDate || undefined,
        clientNotes,
        userId: user?.id ?? null,
        asDraft,
      })
      clearDraft()
      showToast(asDraft ? 'Draft saved.' : 'Revision submitted successfully!', 'success')
      navigate(`/requests/${revision.id}`)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Submission failed.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  function applyTemplate(template: RevisionTemplate) {
    setRawRequest(template.template_text)
    showToast(`Applied template: ${template.name}`, 'info')
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-2 wood-panel" aria-hidden />
          <CardHeader className="relative mt-2">
            <p className="section-label">The desk</p>
            <CardTitle className="text-3xl font-normal">Submit your changes</CardTitle>
            <CardDescription>
              Describe what should change, attach references, and preview the structured output before sending.
            </CardDescription>
          </CardHeader>
          <div className="relative pb-2">
            <Stepper steps={STEPS} currentStep={step} />
          </div>
        </Card>

        {step === 0 ? (
          <Card>
            <Select
              label="Target application"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              options={[
                { value: '', label: 'Select an application' },
                ...projects.map((p) => ({ value: p.id, label: p.name })),
              ]}
              description={selectedProject?.description}
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input label="Contact name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              <Input label="Contact email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              <Select
                label="Urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' },
                ]}
              />
              <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </Card>
        ) : null}

        {step === 1 ? (
          <Card className="space-y-4">
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
            <Textarea
              label="Revision request"
              hint={`${wordCount} words`}
              value={rawRequest}
              onChange={(e) => setRawRequest(e.target.value)}
              placeholder={'Example:\n- Move the primary CTA above the fold\n- Match button color to attached screenshot\n- Keep existing auth flow unchanged'}
              rows={14}
            />
            {similarWarning ? <p className="text-sm text-terracotta" role="alert">{similarWarning}</p> : null}
            <Textarea
              label="Additional notes (optional)"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              rows={3}
            />
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <ImageUpload
              images={images}
              onChange={setImages}
              onAnnotate={setAnnotatingId}
            />
          </Card>
        ) : null}

        {step === 3 && preview ? (
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <LabelBadge>Completeness: {preview.completeness.score}%</LabelBadge>
              {preview.completeness.warnings.map((w) => (
                <span key={w} className="text-xs text-terracotta">{w}</span>
              ))}
            </div>
            <pre className="japandi-code-block max-h-72 overflow-auto rounded-[var(--radius-sm)] p-4 text-xs whitespace-pre-wrap font-mono">
              {preview.formatted}
            </pre>
            <pre className="japandi-code-dark max-h-48 overflow-auto rounded-[var(--radius-sm)] p-4 text-xs whitespace-pre-wrap font-mono">
              {preview.toon}
            </pre>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {step > 0 ? (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 0 && !projectId) || (step === 1 && !rawRequest.trim())}
            >
              Continue
            </Button>
          ) : (
            <>
              <Button onClick={() => void handleSubmit(false)} disabled={submitting || !preview}>
                Submit Revision
              </Button>
              <Button variant="secondary" onClick={() => void handleSubmit(true)} disabled={submitting}>
                Save as Draft
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={handleSaveDraft}>
            Save Draft Locally
          </Button>
        </div>
      </div>

      <aside className="hidden lg:block">
        <Card className="sticky top-28 space-y-3">
          <img src="/art/lantern.svg" alt="" aria-hidden className="h-12 w-8" />
          <p className="section-label">Summary</p>
          <h3 className="font-display text-lg font-medium">Your request</h3>
          <div className="divider-soft" />
          <p className="text-sm text-muted-foreground">Project: {selectedProject?.name ?? 'Not selected'}</p>
          <p className="text-sm text-muted-foreground">Words: {wordCount}</p>
          <p className="text-sm text-muted-foreground">Images: {images.length}</p>
          {preview ? (
            <p className="text-sm font-medium text-moss">Ready to submit ({preview.completeness.score}% complete)</p>
          ) : (
            <p className="text-sm text-muted-foreground">Complete steps to preview.</p>
          )}
        </Card>
      </aside>

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
