import type { AiUsage } from './store'

// --- Vitalis Plus: free-tier limits + entitlement helpers ---------------------
// The `plus` flag lives in the store. Today it's a simulated toggle (set from the
// paywall); when real billing is added, RevenueCat's entitlement will drive it and
// nothing else here has to change.

export const FREE_HABIT_LIMIT = 5
export const FREE_AI_PER_MONTH = 3

export const PLUS_PRICE = '$3.99/mo · $24.99/yr'

// Marketed on the paywall. The first two are enforced in code today; the rest are
// scaffolded to turn on as they're built.
export const PLUS_BENEFITS: string[] = [
  'Unlimited habits',
  'Unlimited AI insights + the most capable model',
  'Advanced analytics, trends & full-year heatmap',
  'Streak freeze & repair tokens',
  'Multiple reminders per habit',
  'Premium themes & app icons',
  'Shareable streak cards',
]

const currentMonth = () => new Date().toISOString().slice(0, 7)

// How many free AI insights remain this month (Infinity for Plus).
export function aiInsightsLeft(plus: boolean, usage: AiUsage): number {
  if (plus) return Infinity
  const used = usage.month === currentMonth() ? usage.count : 0
  return Math.max(0, FREE_AI_PER_MONTH - used)
}

// Whether a free user can add another (non-archived) habit.
export function canAddHabit(plus: boolean, activeHabitCount: number): boolean {
  return plus || activeHabitCount < FREE_HABIT_LIMIT
}
