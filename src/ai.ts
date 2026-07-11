import { supabase, isConfigured } from './supabase'
import { computeStats } from './streaks'
import { getOnline } from './net'
import { log } from './log'
import { useStore, type Habit } from './store'

// Calls the secure ai-insight Edge Function (Claude key stays server-side).
// `fast` requests a lighter, cheaper model (Haiku) instead of the default Opus.
export async function getAIInsight(
  habits: Habit[],
  opts: { fast?: boolean } = {},
): Promise<{ insight?: string; error?: string }> {
  if (!isConfigured) return { error: 'Connect Supabase to enable AI insights.' }
  if (!getOnline()) return { error: 'You’re offline — connect to the internet for AI insights.' }
  if (!habits.length) return { error: 'Add a habit first.' }

  const payload = habits.map((h) => {
    const s = computeStats(h.history, h.frequency)
    return {
      name: h.name,
      frequency: h.frequency,
      category: h.category,
      completedCount: s.completedCount,
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
    }
  })

  const goals = useStore.getState().goals
  log.event('ai_insight_requested', { habitCount: habits.length, fast: !!opts.fast })
  const { data, error } = await supabase.functions.invoke('ai-insight', {
    body: { habits: payload, goals, fast: !!opts.fast },
  })
  if (error) { log.error(error, { where: 'ai-insight' }); return { error: error.message } }
  if (data?.error) return { error: data.error }
  return { insight: data?.insight ?? 'No insight returned.' }
}
