import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { DEFAULT_ORGANIZATION_ID, isInternalRole, isOwnerEmail, resolveUserRole } from '@/lib/access'
import { getAuthRedirectUrl } from '@/lib/authRedirect'
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

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession()
        const sessionUser = data.session?.user
        if (sessionUser) {
          setUser(toAuthUser(sessionUser))
        }
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser(toAuthUser(session.user))
          } else {
            setUser(null)
          }
        })
      } else {
        setUser(getLocalUser())
      }
      setLoading(false)
    }
    void init()
  }, [])

  const signInWithEmail = useCallback(async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Sign in is not configured. Contact your administrator.')
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: getAuthRedirectUrl(),
      },
    })
    if (error) throw error
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
