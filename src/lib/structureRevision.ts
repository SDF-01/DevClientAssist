import type { ReferenceImage, StructuredRevisionRequest } from '@/types/revision'
import { structureRevisionRequest, type StructureOptions } from '@/lib/revisionParser'
import { structuredRevisionSchema } from '@/schemas/revision'

function localRewrite(
  projectSlug: string,
  projectName: string,
  projectDescription: string,
  rawRequest: string,
  images: ReferenceImage[],
  options?: StructureOptions,
): StructuredRevisionRequest {
  const structured = structureRevisionRequest(projectSlug, rawRequest, images, options)
  structured.target.appName = projectName
  structured.target.appDescription = projectDescription
  return structured
}

function parseLlmBrief(value: unknown): StructuredRevisionRequest | null {
  const parsed = structuredRevisionSchema.safeParse(value)
  if (!parsed.success) return null
  if (parsed.data.meta.engine !== 'llm-rewrite') return null
  return parsed.data
}

/**
 * Live rewrite: local engine always runs. When the structure-revision
 * function returns a valid model brief, that replaces local.
 */
export async function structureRevisionWithIntelligence(
  projectSlug: string,
  projectName: string,
  projectDescription: string,
  rawRequest: string,
  images: ReferenceImage[],
  options?: StructureOptions,
): Promise<StructuredRevisionRequest> {
  const local = localRewrite(projectSlug, projectName, projectDescription, rawRequest, images, options)

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) return local

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
        urgency: options?.urgency ?? 'medium',
        clientNotes: options?.clientNotes ?? '',
        images: images.map((image) => ({
          caption: image.caption || image.name,
          publicUrl: image.publicUrl,
        })),
      }),
    })

    if (!response.ok) return local

    const llm = parseLlmBrief(await response.json())
    if (!llm) return local

    return {
      ...llm,
      target: {
        appId: projectSlug,
        appName: projectName,
        appDescription: projectDescription,
      },
      clientInput: {
        rawRequest,
        wordCount: rawRequest.trim().split(/\s+/).filter(Boolean).length,
      },
      references: images.map((image) => ({
        id: image.id,
        name: image.name,
        mimeType: image.mimeType,
        sizeBytes: image.sizeBytes,
        caption: image.caption || `Reference image: ${image.name}`,
        hasImageData: Boolean(image.dataUrl),
      })),
    }
  } catch {
    return local
  }
}
