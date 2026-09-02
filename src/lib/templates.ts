import { localListTemplates } from '@/lib/data/localStore'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import type { RevisionTemplate } from '@/types/database'

export async function listTemplates(): Promise<RevisionTemplate[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('revision_templates').select('*').order('name')
    if (error) throw error
    return data as RevisionTemplate[]
  }
  return localListTemplates()
}
