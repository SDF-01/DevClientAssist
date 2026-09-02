import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import { getLocalUser, setLocalUser } from '@/lib/data/localStore'
import type { UserRole } from '@/types/database'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: UserRole
  organization_id: string
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
          setUser({
            id: sessionUser.id,
            email: sessionUser.email ?? '',
            full_name: (sessionUser.user_metadata?.full_name as string) ?? '',
            role: ((sessionUser.app_metadata?.role as UserRole) ?? 'client_editor'),
            organization_id: (sessionUser.app_metadata?.organization_id as string) ?? '',
          })
        }
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              full_name: (session.user.user_metadata?.full_name as string) ?? '',
              role: ((session.user.app_metadata?.role as UserRole) ?? 'client_editor'),
              organization_id: (session.user.app_metadata?.organization_id as string) ?? '',
            })
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
      options: { emailRedirectTo: window.location.origin },
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

  const isInternal = user?.role === 'developer' || user?.role === 'admin'

  return { user, loading, signInWithEmail, signOut, isInternal, isAuthenticated: Boolean(user) }
}
