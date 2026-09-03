import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth, type SignInOutcome } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'

interface SignInPanelProps {
  onClose?: () => void
}

function outcomeCopy(outcome: SignInOutcome, email: string) {
  switch (outcome) {
    case 'link_sent':
      return {
        title: 'Link sent',
        body: `We sent a sign-in link to ${email}. Open it on this device to continue.`,
      }
    case 'pending':
      return {
        title: 'Waiting for approval',
        body: `${email} was submitted. mandrewschaeffer@gmail.com has to approve this account before you can sign in.`,
      }
    case 'denied':
      return {
        title: 'Account denied',
        body: `${email} was not approved. Ask the site owner if you need access.`,
      }
    case 'approved':
    case 'none':
      return {
        title: 'Check your email',
        body: `If ${email} is approved, a sign-in link is on the way.`,
      }
    default: {
      const _exhaustive: never = outcome
      return _exhaustive
    }
  }
}

export function SignInPanel({ onClose }: SignInPanelProps) {
  const { signInWithEmail } = useAuth()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [outcome, setOutcome] = useState<SignInOutcome | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    try {
      const result = await signInWithEmail(email.trim())
      setOutcome(result)
      if (result === 'link_sent') {
        showToast('Check your email for a sign-in link.', 'success')
      } else if (result === 'pending') {
        showToast('Account request sent. The owner must approve it.', 'success')
      } else if (result === 'denied') {
        showToast('This account was not approved.', 'error')
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Sign in failed.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (outcome) {
    const copy = outcomeCopy(outcome, email)
    return (
      <div className="space-y-3 text-sm">
        <p className="font-display text-lg text-foreground">{copy.title}</p>
        <p className="text-muted-foreground">{copy.body}</p>
        {onClose ? (
          <div className="page-actions">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
      <div>
        <p className="font-display text-xl text-foreground">Sign in</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The site owner can sign in immediately. Anyone else is asking for an account that the owner must approve.
        </p>
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
      <div className="page-actions">
        <Button type="submit" disabled={submitting || !email.trim()}>
          Continue
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
