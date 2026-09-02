import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import { getLocalUser, setLocalUser, type LocalUser } from '@/lib/data/localStore'
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

  const signInDemo = useCallback((role: UserRole = 'client_editor') => {
    const demoUser: LocalUser = {
      id: crypto.randomUUID(),
      email: role === 'admin' || role === 'developer' ? 'dev@example.com' : 'client@example.com',
      full_name: role === 'admin' ? 'Admin User' : role === 'developer' ? 'Developer User' : 'Client User',
      role,
      organization_id: '00000000-0000-0000-0000-000000000001',
    }
    setLocalUser(demoUser)
    setUser(demoUser)
  }, [])

  const signInWithEmail = useCallback(async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      return
    }
    signInDemo('client_editor')
  }, [signInDemo])

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    setLocalUser(null)
    setUser(null)
  }, [])

  const isInternal = user?.role === 'developer' || user?.role === 'admin'

  return { user, loading, signInDemo, signInWithEmail, signOut, isInternal, isAuthenticated: Boolean(user) }
}
