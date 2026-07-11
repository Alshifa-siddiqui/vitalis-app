import { supabase, isConfigured } from './supabase'
import { computeStats, isDoneToday, todayISO } from './streaks'
import { getOnline } from './net'
import { log } from './log'
import { useStore, type Habit } from './store'

// ISO dates for the last 7 days (index 0 = today).
function last7Set(): Set<string> {
  const s = new Set<string>()
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    s.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  return s
}

// Same-state cache: repeated taps without any change return the last insight
// instead of re-billing the API. Cleared implicitly when a check-in changes the
// signature. In-memory (resets on app restart), which is enough to stop repeats.
let cache: { sig: string; text: string } | null = null

// Calls the secure ai-insight Edge Function (Claude key stays server-side).
// `fast` requests a lighter, cheaper model (Haiku) instead of the default Opus.
export async function getAIInsight(
  habits: Habit[],
  opts: { fast?: boolean } = {},
): Promise<{ insight?: string; error?: string; cached?: boolean }> {
  if (!isConfigured) return { error: 'Connect Supabase to enable AI insights.' }
  if (!getOnline()) return { error: 'You’re offline — connect to the internet for AI insights.' }
  if (!habits.length) return { error: 'Add a habit first.' }

  const week = last7Set()
  const payload = habits.map((h) => {
    const st = computeStats(h.history, h.frequency, h.days)
    return {
      name: h.name,
      category: h.category,
      frequency: h.frequency,
      currentStreak: st.currentStreak,
      longestStreak: st.longestStreak,
      completedCount: st.completedCount,
      last7: h.history.filter((d) => week.has(d)).length,
      doneToday: isDoneToday(h.history),
    }
  })
  const dailyCount = habits.filter((h) => h.frequency === 'daily').length
  const done7 = payload.reduce((a, p) => a + p.last7, 0)
  const rate7 = dailyCount ? Math.round((100 * done7) / (dailyCount * 7)) : null

  const state = useStore.getState()
  const goals = state.goals
  const recentWorkouts = state.workouts.filter((w) => week.has(w.date))
  const workouts7 = { sessions: recentWorkouts.length, minutes: recentWorkouts.reduce((a, w) => a + w.minutes, 0) }

  const sig = `${todayISO()}|${opts.fast ? 'f' : 'q'}|${workouts7.sessions}|${payload.map((p) => `${p.name}:${p.currentStreak}:${p.doneToday}`).join(',')}`
  if (cache && cache.sig === sig) return { insight: cache.text, cached: true }

  log.event('ai_insight_requested', { habitCount: habits.length, fast: !!opts.fast, rate7: rate7 ?? -1 })
  const { data, error } = await supabase.functions.invoke('ai-insight', {
    body: { habits: payload, goals, fast: !!opts.fast, rate7, workouts7 },
  })
  if (error) { log.error(error, { where: 'ai-insight' }); return { error: error.message } }
  if (data?.error) return { error: data.error }

  const insight = data?.insight ?? 'No insight returned.'
  cache = { sig, text: insight }
  return { insight }
}
