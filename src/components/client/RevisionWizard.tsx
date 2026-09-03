import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stepper } from '@/components/ui/Stepper'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { ImageUpload } from '@/components/client/ImageUpload'
import { ImageAnnotator } from '@/components/client/ImageAnnotator'
import { ChatGptFormatStep } from '@/components/client/ChatGptFormatStep'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { useRevisionDraft } from '@/hooks/useRevisionDraft'
import { listProjects } from '@/lib/data/projects'
import { listRevisions, submitRevision } from '@/lib/data/revisions'
import { detectSimilarRequests } from '@/lib/versioning'
import { listTemplates } from '@/lib/templates'
import { buildChatGptRevisionPrompt } from '@/lib/chatgptBrief'
import type { Project, RevisionTemplate } from '@/types/database'
import type { ReferenceImage } from '@/types/revision'

const STEPS = ['Write', 'Ask ChatGPT', 'Pictures', 'Review']

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
  const [formattedBrief, setFormattedBrief] = useState('')
  const [images, setImages] = useState<ReferenceImage[]>([])
  const [contactName, setContactName] = useState('')
  const [urgency, setUrgency] = useState('medium')
  const [clientNotes, setClientNotes] = useState('')
  const [annotatingId, setAnnotatingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [similarWarning, setSimilarWarning] = useState<string | null>(null)

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
      setFormattedBrief(draft.formattedBrief ?? '')
      setImages(draft.images)
    }
  }, [draft])

  const selectedProject = projects.find((p) => p.id === projectId)
  const wordCount = useMemo(() => rawRequest.trim().split(/\s+/).filter(Boolean).length, [rawRequest])
  const chatgptPrompt = useMemo(
    () =>
      buildChatGptRevisionPrompt({
        appName: selectedProject?.name ?? 'Airmen Voice',
        appDescription: selectedProject?.description ?? 'Voice and communication platform for airmen',
        rawRequest,
        urgency,
        clientNotes,
        screenshotNames: images.map((image) => image.caption.trim() || image.name),
      }),
    [selectedProject, rawRequest, urgency, clientNotes, images],
  )

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
    saveDraft({
      projectId,
      rawRequest,
      contactName,
      urgency,
      clientNotes,
      formattedBrief,
      images,
    })
    showToast('Draft saved on this device.', 'success')
  }

  async function handleSubmit(asDraft = false) {
    if (!projectId || !rawRequest.trim()) {
      showToast('Write what should change before sending.', 'error')
      return
    }
    if (!formattedBrief.trim()) {
      showToast('Paste or upload the ChatGPT .toon file before sending.', 'error')
      setStep(1)
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
        formattedBrief,
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
  const canContinueFormat = formattedBrief.trim().length > 20

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <p className="section-label">New request</p>
        <h1 className="font-display text-3xl font-normal sm:text-4xl">What should we change?</h1>
        {selectedProject ? <p className="app-chip">{selectedProject.name}</p> : null}
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Write your notes, copy them into ChatGPT with the prompt we give you, then paste the .toon file ChatGPT
          creates.
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
                    className="rounded-[var(--radius-pill)] border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium tracking-wide text-foreground transition-colors hover:border-pastel-rose/50 hover:bg-blush/30"
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
        <ChatGptFormatStep
          prompt={chatgptPrompt}
          formattedBrief={formattedBrief}
          onFormattedBriefChange={setFormattedBrief}
        />
      ) : null}

      {step === 2 ? (
        <Card framed>
          <CardHeader>
            <CardTitle className="text-2xl font-normal">Pictures help, but they are optional</CardTitle>
            <CardDescription>
              Add screenshots if they show the issue. The developer will see them with the .toon file.
            </CardDescription>
          </CardHeader>
          <ImageUpload images={images} onChange={setImages} onAnnotate={setAnnotatingId} />
        </Card>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <Card framed className="space-y-4">
            <CardHeader>
              <CardTitle className="text-2xl font-normal">This is what the developer will receive</CardTitle>
              <CardDescription>The .toon file below is the request. You can go back and edit it.</CardDescription>
            </CardHeader>
            <pre className="code-block-light max-h-80 overflow-auto rounded-[var(--radius-sm)] p-4 text-sm whitespace-pre-wrap font-mono">
              {formattedBrief}
            </pre>
          </Card>
          <Card className="space-y-2">
            <p className="section-label">Your original notes</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{rawRequest}</p>
          </Card>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {step > 0 ? (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : null}
        {step === 0 ? (
          <Button onClick={() => setStep(1)} disabled={!canContinueWrite}>
            Continue to ChatGPT
          </Button>
        ) : null}
        {step === 1 ? (
          <Button onClick={() => setStep(2)} disabled={!canContinueFormat}>
            Continue
          </Button>
        ) : null}
        {step === 2 ? (
          <>
            <Button onClick={() => setStep(3)}>Continue to review</Button>
            {images.length === 0 ? (
              <Button variant="ghost" onClick={() => setStep(3)}>
                Continue without pictures
              </Button>
            ) : null}
          </>
        ) : null}
        {step === 3 ? (
          <Button onClick={() => void handleSubmit(false)} disabled={submitting || !canContinueFormat}>
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
