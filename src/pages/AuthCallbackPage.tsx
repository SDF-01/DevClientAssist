import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { EmailOtpType } from '@supabase/supabase-js'
import { SignInPanel } from '@/components/auth/SignInPanel'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase/client'

const OTP_TYPES: EmailOtpType[] = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']

function asOtpType(value: string | null): EmailOtpType {
  return value && OTP_TYPES.includes(value as EmailOtpType) ? (value as EmailOtpType) : 'email'
}

function readAuthError(): string | null {
  const search = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const description = search.get('error_description') || hash.get('error_description') || search.get('error')
  return description ? description.replace(/\+/g, ' ') : null
}

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setError('Sign in is not configured.')
      return
    }

    const existingError = readAuthError()
    if (existingError) {
      setError(existingError)
      return
    }

    let cancelled = false
    let timeoutId = 0
    let unsubscribe: (() => void) | undefined
    const search = new URLSearchParams(window.location.search)

    async function completeAuth() {
      const tokenHash = search.get('token_hash')
      if (tokenHash && supabase) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: asOtpType(search.get('type')),
        })
        if (verifyError) throw verifyError
      }

      const { data, error: sessionError } = await supabase!.auth.getSession()
      if (sessionError) throw sessionError
      if (data.session) {
        if (!cancelled) navigate('/', { replace: true })
        return
      }

      const { data: listener } = supabase!.auth.onAuthStateChange((_event, session) => {
        if (session && !cancelled) navigate('/', { replace: true })
      })
      unsubscribe = () => listener.subscription.unsubscribe()

      timeoutId = window.setTimeout(() => {
        if (!cancelled) {
          setError('This sign-in link is invalid or has expired. Request a new one from this page.')
        }
      }, 4000)
    }

    void completeAuth().catch((caught: unknown) => {
      if (!cancelled) {
        setError(caught instanceof Error ? caught.message : 'Could not finish sign in.')
      }
    })

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
      unsubscribe?.()
    }
  }, [navigate])

  return (
    <Card className="mx-auto max-w-md">
      {error ? (
        <div className="space-y-5">
          <div>
            <p className="font-display text-2xl text-foreground">Could not finish sign in</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{error}</p>
          </div>
          <SignInPanel />
          <Link to="/" className="inline-block text-sm text-accent-primary underline-offset-4 hover:underline">
            Back to home
          </Link>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Finishing sign in…</p>
      )}
    </Card>
  )
}
