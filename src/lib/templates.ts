import { localListTemplates } from '@/lib/data/localStore'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import type { RevisionTemplate } from '@/types/database'

export const TEMPLATE_DISPLAY_ORDER = [
  'Bug Fix Report',
  'Features',
  'Copy Change',
  'Homepage Hero Update',
]

export function sortTemplates(templates: RevisionTemplate[]): RevisionTemplate[] {
  return [...templates].sort((a, b) => {
    const aIndex = TEMPLATE_DISPLAY_ORDER.indexOf(a.name)
    const bIndex = TEMPLATE_DISPLAY_ORDER.indexOf(b.name)
    if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })
}

export async function listTemplates(): Promise<RevisionTemplate[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('revision_templates').select('*').order('name')
    if (error) throw error
    return sortTemplates(data as RevisionTemplate[])
  }
  return sortTemplates(localListTemplates())
}
