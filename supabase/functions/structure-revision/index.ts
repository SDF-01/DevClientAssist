import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StructureRequest {
  projectSlug: string;
  projectName: string;
  projectDescription: string;
  rawRequest: string;
  images: Array<{ caption: string; publicUrl?: string }>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as StructureRequest;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    let structured;

    if (openaiKey) {
      const prompt = `Rewrite this client revision request into clear, structured development instructions.
Project: ${body.projectName} - ${body.projectDescription}
Raw request: ${body.rawRequest}
Reference images: ${body.images.map((i) => i.caption).join(", ") || "none"}

Return JSON with: title, overview, goals[], revisions[{summary, details, category, priority, acceptanceCriteria[]}], constraints[], outOfScope[], notesForDeveloper[]`;

      const llmResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });

      const llmData = await llmResponse.json();
      const parsed = JSON.parse(llmData.choices[0].message.content);

      structured = {
        meta: {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          source: "client-revision-portal",
          version: "2.0-llm",
        },
        target: {
          appId: body.projectSlug,
          appName: body.projectName,
          appDescription: body.projectDescription,
        },
        clientInput: {
          rawRequest: body.rawRequest,
          wordCount: body.rawRequest.split(/\s+/).filter(Boolean).length,
        },
        instructions: {
          title: parsed.title ?? `Revision for ${body.projectName}`,
          overview: parsed.overview ?? "",
          goals: parsed.goals ?? [],
          constraints: parsed.constraints ?? [],
          outOfScope: parsed.outOfScope ?? [],
        },
        revisions: (parsed.revisions ?? []).map((r: Record<string, unknown>, i: number) => ({
          id: crypto.randomUUID(),
          order: i + 1,
          category: r.category ?? "other",
          priority: r.priority ?? "medium",
          summary: r.summary ?? "",
          details: r.details ?? "",
          acceptanceCriteria: r.acceptanceCriteria ?? [],
        })),
        references: body.images.map((img, i) => ({
          id: crypto.randomUUID(),
          name: `reference-${i + 1}`,
          mimeType: "image/png",
          sizeBytes: 0,
          caption: img.caption,
          hasImageData: false,
          publicUrl: img.publicUrl,
        })),
        agentGuidance: {
          executionOrder: (parsed.revisions ?? []).map(
            (r: Record<string, string>, i: number) => `${i + 1}. ${r.summary}`,
          ),
          verificationSteps: ["Validate all acceptance criteria", "Run regression checks"],
          notesForDeveloper: parsed.notesForDeveloper ?? [],
        },
      };
    } else {
      // Heuristic fallback inside edge function
      structured = {
        meta: {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          source: "client-revision-portal",
          version: "1.0-edge",
        },
        target: {
          appId: body.projectSlug,
          appName: body.projectName,
          appDescription: body.projectDescription,
        },
        clientInput: {
          rawRequest: body.rawRequest,
          wordCount: body.rawRequest.split(/\s+/).filter(Boolean).length,
        },
        instructions: {
          title: `Revision request for ${body.projectName}`,
          overview: body.rawRequest.slice(0, 200),
          goals: body.rawRequest.split("\n").filter((l) => l.trim()).slice(0, 5),
          constraints: [],
          outOfScope: [],
        },
        revisions: body.rawRequest
          .split("\n")
          .filter((l) => l.trim())
          .map((line, i) => ({
            id: crypto.randomUUID(),
            order: i + 1,
            category: "other",
            priority: "medium",
            summary: line.replace(/^[-*•]\s*/, "").slice(0, 100),
            details: line,
            acceptanceCriteria: [`Verify: ${line}`],
          })),
        references: [],
        agentGuidance: {
          executionOrder: [],
          verificationSteps: [],
          notesForDeveloper: [],
        },
      };
    }

    return new Response(JSON.stringify(structured), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
