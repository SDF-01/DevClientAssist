import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { DEFAULT_ORGANIZATION_ID, isInternalRole, isOwnerEmail, resolveUserRole } from '@/lib/access'
import { getAuthRedirectUrl } from '@/lib/authRedirect'
import { getAccountAccess, requestAccountAccess, type AccountAccessStatus } from '@/lib/data/accounts'
import { getLocalUser, setLocalUser } from '@/lib/data/localStore'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import type { UserRole } from '@/types/database'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: UserRole
  organization_id: string
}

function toAuthUser(sessionUser: User): AuthUser {
  const email = sessionUser.email ?? ''
  return {
    id: sessionUser.id,
    email,
    full_name: (sessionUser.user_metadata?.full_name as string) ?? '',
    role: resolveUserRole(email, sessionUser.app_metadata?.role as string | undefined),
    organization_id:
      (sessionUser.app_metadata?.organization_id as string | undefined) || DEFAULT_ORGANIZATION_ID,
  }
}

export type SignInOutcome = AccountAccessStatus | 'link_sent'

async function acceptApprovedSession(sessionUser: User): Promise<AuthUser | null> {
  const access = await getAccountAccess(sessionUser.email ?? '')
  if (access !== 'approved') {
    if (supabase) await supabase.auth.signOut()
    return null
  }
  return toAuthUser(sessionUser)
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession()
        const sessionUser = data.session?.user
        if (sessionUser) {
          setUser(await acceptApprovedSession(sessionUser))
        }
        supabase.auth.onAuthStateChange((_event, session) => {
          void (async () => {
            if (session?.user) {
              setUser(await acceptApprovedSession(session.user))
            } else {
              setUser(null)
            }
          })()
        })
      } else {
        const localUser = getLocalUser()
        setUser(localUser && isOwnerEmail(localUser.email) ? localUser : null)
      }
      setLoading(false)
    }
    void init()
  }, [])

  const signInWithEmail = useCallback(async (email: string): Promise<SignInOutcome> => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Sign in is not configured. Contact your administrator.')
    }

    const access = await getAccountAccess(email)
    switch (access) {
      case 'approved': {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: getAuthRedirectUrl(),
          },
        })
        if (error) throw error
        return 'link_sent'
      }
      case 'denied':
        return 'denied'
      case 'pending':
        return 'pending'
      case 'none': {
        const requested = await requestAccountAccess(email)
        if (requested !== 'approved') return requested
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: getAuthRedirectUrl(),
          },
        })
        if (error) throw error
        return 'link_sent'
      }
      default: {
        const _exhaustive: never = access
        return _exhaustive
      }
    }
  }, [])

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    setLocalUser(null)
    setUser(null)
  }, [])

  const isOwner = isOwnerEmail(user?.email)
  const isInternal = isOwner || isInternalRole(user?.role)

  return { user, loading, signInWithEmail, signOut, isOwner, isInternal, isAuthenticated: Boolean(user) }
}
