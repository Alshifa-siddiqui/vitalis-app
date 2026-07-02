// Vitalis — AI wellness insight (Supabase Edge Function)
// Calls Claude server-side so the API key never ships in the app.
// Deploy: supabase functions deploy ai-insight
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Requires the ai_usage table (see supabase/schema.sql) for the daily quota.
import Anthropic from "npm:@anthropic-ai/sdk"
import { createClient } from "npm:@supabase/supabase-js@2"

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

const DAILY_LIMIT = 20       // insights per user per day
const MAX_HABITS = 100       // ignore anything past this to bound the prompt
const MODEL_QUALITY = "claude-opus-4-8"
const MODEL_FAST = "claude-haiku-4-5-20251001"

// Best-effort daily quota keyed by user id. Returns true if the caller is over
// the limit. Fails open (allows the request) if the usage table isn't reachable
// so a misconfigured DB never fully breaks the feature.
async function overQuota(userId: string): Promise<boolean> {
  const url = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!url || !serviceKey) return false
  try {
    const admin = createClient(url, serviceKey)
    const day = new Date().toISOString().slice(0, 10) // YYYY-MM-DD (UTC)
    const { data } = await admin
      .from("ai_usage")
      .select("count")
      .eq("user_id", userId)
      .eq("day", day)
      .maybeSingle()
    const count = data?.count ?? 0
    if (count >= DAILY_LIMIT) return true
    await admin
      .from("ai_usage")
      .upsert({ user_id: userId, day, count: count + 1 }, { onConflict: "user_id,day" })
    return false
  } catch {
    return false
  }
}

// Resolve the caller's user id from their JWT so the quota is per-account.
async function userIdFrom(req: Request): Promise<string | null> {
  const url = Deno.env.get("SUPABASE_URL")
  const anon = Deno.env.get("SUPABASE_ANON_KEY")
  const auth = req.headers.get("Authorization")
  if (!url || !anon || !auth) return null
  try {
    const client = createClient(url, anon, { global: { headers: { Authorization: auth } } })
    const { data } = await client.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
  if (!apiKey) return json({ error: "AI is not configured on the server yet." }, 503)

  let habits: HabitSummary[] = []
  let goals: string[] = []
  let fast = false
  try {
    const body = await req.json()
    habits = Array.isArray(body?.habits) ? body.habits.slice(0, MAX_HABITS) : []
    goals = Array.isArray(body?.goals) ? body.goals.slice(0, 20) : []
    fast = !!body?.fast
  } catch {
    return json({ error: "Invalid request body." }, 400)
  }
  if (!habits.length) return json({ error: "No habits to analyze yet." }, 400)

  // Enforce a per-user daily quota (only when we can identify the user).
  const userId = await userIdFrom(req)
  if (userId && (await overQuota(userId))) {
    return json({ error: "Daily AI insight limit reached. Try again tomorrow." }, 429)
  }

  const summary = habits
    .map((h) => `- ${h.name} (${h.frequency}, ${h.category}): ${h.completedCount} total check-ins, current streak ${h.currentStreak}, best ${h.longestStreak}`)
    .join("\n")
  const goalLine = goals.length
    ? `\n\nThe user's stated focus goals are: ${goals.join(", ")}. Tailor your suggestion toward these where it fits.`
    : ""

  try {
    const anthropic = new Anthropic({ apiKey })
    const msg = await anthropic.messages.create({
      model: fast ? MODEL_FAST : MODEL_QUALITY,
      max_tokens: 600,
      system:
        "You are a warm, encouraging wellness coach inside the Vitalis habit app. " +
        "Given the user's habits and streaks, reply with 2-3 short, specific, supportive observations " +
        "and ONE concrete suggestion for tomorrow. Be concise and motivating. " +
        "This is general wellness encouragement, NOT medical advice — never diagnose or prescribe. " +
        "Reply in plain text (no markdown headings), under 120 words.",
      messages: [
        { role: "user", content: `Here are my habits:\n${summary}${goalLine}\n\nGive me a short personalized insight.` },
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
