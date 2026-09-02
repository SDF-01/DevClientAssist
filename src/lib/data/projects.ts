import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import type { Project } from '@/types/database'
import { localGetProject, localListProjects } from './localStore'

export async function listProjects(): Promise<Project[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .eq('slug', 'airmen-voice')
      .order('name')
    if (error) throw error
    return data as Project[]
  }
  return localListProjects().filter((p) => p.slug === 'airmen-voice')
}

export async function getProject(idOrSlug: string): Promise<Project | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .maybeSingle()
    if (error) throw error
    return data as Project | null
  }
  return localGetProject(idOrSlug) ?? null
}
