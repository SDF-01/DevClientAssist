import type { StructuredRevisionRequest } from '@/types/revision'
import { structureRevisionRequest } from '@/lib/revisionParser'

/**
 * Stage 2 structuring: calls Supabase Edge Function when configured,
 * otherwise falls back to enhanced local heuristic parser.
 */
export async function structureRevisionWithIntelligence(
  projectSlug: string,
  projectName: string,
  projectDescription: string,
  rawRequest: string,
  images: Array<{ caption: string; publicUrl?: string }>,
): Promise<StructuredRevisionRequest> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && anonKey) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/structure-revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          projectSlug,
          projectName,
          projectDescription,
          rawRequest,
          images,
        }),
      })

      if (response.ok) {
        return (await response.json()) as StructuredRevisionRequest
      }
    } catch {
      // Fall through to local parser
    }
  }

  const local = structureRevisionRequest(projectSlug, rawRequest, [])
  local.target.appName = projectName
  local.target.appDescription = projectDescription
  return local
}
