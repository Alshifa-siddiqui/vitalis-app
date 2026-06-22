// Streak / completion logic — ported from the (tested) Python VitalisDB._compute_stats.
// habit_history is the single source of truth: streaks & counts are DERIVED, never stored.

export type Frequency = 'daily' | 'weekly' | 'monthly'

export const GAP: Record<Frequency, number> = { daily: 1, weekly: 7, monthly: 31 }

export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

export type Stats = {
  completedCount: number
  currentStreak: number
  longestStreak: number
  lastCompleted: string | null
}

function streakRuns(dates: Date[], gap: number): { longest: number; current: number } {
  if (dates.length === 0) return { longest: 0, current: 0 }
  let longest = 0
  let run = 0
  let prev: Date | null = null
  for (const d of dates) {
    const diff = prev ? daysBetween(prev, d) : 0
    run = prev && diff > 0 && diff <= gap ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = d
  }
  // current run ends at the most recent date, valid only if within `gap` of today
  let current = 0
  const last = dates[dates.length - 1]
  if (daysBetween(last, toDate(todayISO())) <= gap) {
    let p: Date | null = null
    for (let i = dates.length - 1; i >= 0; i--) {
      const d = dates[i]
      const diff = p ? daysBetween(d, p) : 0
      if (p === null || (diff > 0 && diff <= gap)) {
        current += 1
        p = d
      } else break
    }
  }
  return { longest, current }
}

export function computeStats(history: string[], frequency: Frequency): Stats {
  const unique = Array.from(new Set(history)).sort()
  const dates = unique.map(toDate)
  const { longest, current } = streakRuns(dates, GAP[frequency] ?? 1)
  return {
    completedCount: unique.length,
    currentStreak: current,
    longestStreak: longest,
    lastCompleted: unique.length ? unique[unique.length - 1] : null,
  }
}

export function isDoneToday(history: string[]): boolean {
  return history.includes(todayISO())
}

// Badge rules (ported from VitalisDB._check_badges)
export const BADGES: { icon: string; name: string; test: (s: Stats) => boolean }[] = [
  { icon: '🔥', name: 'First Flame', test: (s) => s.completedCount >= 1 },
  { icon: '⚡', name: 'Week Warrior', test: (s) => s.currentStreak >= 7 },
  { icon: '🎯', name: 'Dedicated', test: (s) => s.completedCount >= 30 },
  { icon: '💎', name: 'Fortnight', test: (s) => s.currentStreak >= 14 },
  { icon: '🌟', name: 'Consistent', test: (s) => s.completedCount >= 50 },
  { icon: '🏆', name: 'Month Master', test: (s) => s.currentStreak >= 30 },
  { icon: '👑', name: 'Century', test: (s) => s.completedCount >= 100 },
]
