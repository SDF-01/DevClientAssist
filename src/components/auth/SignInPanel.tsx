import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'

interface SignInPanelProps {
  onClose?: () => void
}

export function SignInPanel({ onClose }: SignInPanelProps) {
  const { signInWithEmail } = useAuth()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    try {
      await signInWithEmail(email.trim())
      setSent(true)
      showToast('Check your email for a sign-in link.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Sign in failed.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-3 text-sm">
        <p className="font-display text-lg text-foreground">Link sent</p>
        <p className="text-muted-foreground">
          We sent a sign-in link to <strong className="text-foreground">{email}</strong>. Open it on this device to
          continue.
        </p>
        {onClose ? (
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
      <div>
        <p className="font-display text-xl text-foreground">Sign in</p>
        <p className="mt-1 text-sm text-muted-foreground">Use your work email to access requests and team tools.</p>
      </div>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting || !email.trim()}>
          Send sign-in link
        </Button>
        {onClose ? (
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
