import { useEffect, useState, useCallback } from 'react'
import { supabase, isConfigured } from './supabase'
import { useAuth } from './auth'
import { useStore, type Habit } from './store'

// Maps a Supabase row to the local Habit shape.
function rowToHabit(r: any): Habit {
  return {
    id: r.id,
    name: r.name,
    icon: r.icon ?? '✅',
    frequency: r.frequency ?? 'daily',
    category: r.category ?? 'General',
    createdAt: (r.created_at ?? '').slice(0, 10),
    history: Array.isArray(r.history) ? r.history : [],
  }
}

export async function pullHabits(userId: string): Promise<void> {
  if (!isConfigured) return
  const { data, error } = await supabase.from('habits').select('*').eq('user_id', userId)
  if (error || !data) return
  if (data.length) useStore.setState({ habits: data.map(rowToHabit) })
}

export async function pushHabits(userId: string, habits: Habit[]): Promise<void> {
  if (!isConfigured) return
  const rows = habits.map((h) => ({
    id: h.id, user_id: userId, name: h.name, icon: h.icon,
    frequency: h.frequency, category: h.category, history: h.history,
  }))
  if (rows.length) await supabase.from('habits').upsert(rows)
  // Reconcile deletions: remove cloud rows that no longer exist locally.
  const { data } = await supabase.from('habits').select('id').eq('user_id', userId)
  const localIds = new Set(habits.map((h) => h.id))
  const stale = (data ?? []).map((r) => r.id).filter((id) => !localIds.has(id))
  if (stale.length) await supabase.from('habits').delete().in('id', stale)
}

// Pull-to-refresh: re-fetch this user's habits from the cloud.
export function usePullRefresh() {
  const { user } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    if (isConfigured && user?.id) await pullHabits(user.id)
    setRefreshing(false)
  }, [user?.id])
  return { refreshing, onRefresh }
}

// Pull on login, then push (debounced) whenever local habits change.
export function useCloudSync(userId: string | undefined): void {
  useEffect(() => {
    if (!isConfigured || !userId) return
    pullHabits(userId)
    let t: ReturnType<typeof setTimeout>
    const unsub = useStore.subscribe((state) => {
      clearTimeout(t)
      t = setTimeout(() => pushHabits(userId, state.habits), 600)
    })
    return () => { clearTimeout(t); unsub() }
  }, [userId])
}
