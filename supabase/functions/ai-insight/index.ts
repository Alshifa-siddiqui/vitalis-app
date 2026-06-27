// Vitalis — AI wellness insight (Supabase Edge Function)
// Calls Claude server-side so the API key never ships in the app.
// Deploy: supabase functions deploy ai-insight
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
import Anthropic from "npm:@anthropic-ai/sdk"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  })
}

type HabitSummary = {
  name: string; frequency: string; category: string
  completedCount: number; currentStreak: number; longestStreak: number
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
  if (!apiKey) return json({ error: "AI is not configured on the server yet." }, 503)

  let habits: HabitSummary[] = []
  try {
    habits = (await req.json())?.habits ?? []
  } catch {
    return json({ error: "Invalid request body." }, 400)
  }
  if (!habits.length) return json({ error: "No habits to analyze yet." }, 400)

  const summary = habits
    .map((h) => `- ${h.name} (${h.frequency}, ${h.category}): ${h.completedCount} total check-ins, current streak ${h.currentStreak}, best ${h.longestStreak}`)
    .join("\n")

  try {
    const anthropic = new Anthropic({ apiKey })
    const msg = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 600,
      system:
        "You are a warm, encouraging wellness coach inside the Vitalis habit app. " +
        "Given the user's habits and streaks, reply with 2-3 short, specific, supportive observations " +
        "and ONE concrete suggestion for tomorrow. Be concise and motivating. " +
        "This is general wellness encouragement, NOT medical advice — never diagnose or prescribe. " +
        "Reply in plain text (no markdown headings), under 120 words.",
      messages: [
        { role: "user", content: `Here are my habits:\n${summary}\n\nGive me a short personalized insight.` },
      ],
    })
    const insight = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim()
    return json({ insight })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "AI request failed." }, 500)
  }
})
