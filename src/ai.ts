import { supabase, isConfigured } from './supabase'
import { computeStats } from './streaks'
import type { Habit } from './store'

// Calls the secure ai-insight Edge Function (Claude key stays server-side).
export async function getAIInsight(
  habits: Habit[],
): Promise<{ insight?: string; error?: string }> {
  if (!isConfigured) return { error: 'Connect Supabase to enable AI insights.' }
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
  const { data, error } = await supabase.functions.invoke('ai-insight', {
    body: { habits: payload, goals },
  })
  if (error) return { error: error.message }
  if (data?.error) return { error: data.error }
  return { insight: data?.insight ?? 'No insight returned.' }
}
