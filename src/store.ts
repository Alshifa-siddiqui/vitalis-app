import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Frequency, todayISO } from './streaks'

export type Habit = {
  id: string
  name: string
  icon: string
  frequency: Frequency
  category: string
  createdAt: string
  history: string[] // ISO dates of check-ins
  reminderTime?: string // "HH:MM" local time, or undefined for no reminder
  archived?: boolean
}

function isoDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
// `count` consecutive days ending `endOffset` days ago (0 = today)
const run = (count: number, endOffset = 0) =>
  Array.from({ length: count }, (_, i) => isoDaysAgo(endOffset + i))

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

const SEED: Habit[] = [
  { id: 's1', name: 'Morning Run', icon: '🏃', frequency: 'daily', category: 'Fitness', createdAt: isoDaysAgo(30), history: run(12, 0) },
  { id: 's2', name: 'Drink Water', icon: '💧', frequency: 'daily', category: 'Health', createdAt: isoDaysAgo(30), history: run(5, 0) },
  { id: 's3', name: 'Meditation', icon: '🧘', frequency: 'daily', category: 'Mental', createdAt: isoDaysAgo(30), history: run(3, 1) },
  { id: 's4', name: 'Read 20 Pages', icon: '📖', frequency: 'daily', category: 'Learning', createdAt: isoDaysAgo(30), history: run(8, 1) },
  { id: 's5', name: 'Sleep by 11pm', icon: '😴', frequency: 'daily', category: 'Health', createdAt: isoDaysAgo(30), history: run(4, 1) },
]

export type NewHabit = { name: string; icon: string; frequency: Frequency; category: string; reminderTime?: string }

// Starter habit suggested for each onboarding goal.
const STARTER: Record<string, NewHabit> = {
  Fitness: { name: 'Morning Workout', icon: '🏃', frequency: 'daily', category: 'Fitness' },
  Sleep: { name: 'Sleep by 11pm', icon: '😴', frequency: 'daily', category: 'Health' },
  Nutrition: { name: 'Eat Healthy', icon: '🥗', frequency: 'daily', category: 'Health' },
  Mindfulness: { name: 'Meditate', icon: '🧘', frequency: 'daily', category: 'Mental' },
  Learning: { name: 'Read 20 Pages', icon: '📖', frequency: 'daily', category: 'Learning' },
  Hydration: { name: 'Drink Water', icon: '💧', frequency: 'daily', category: 'Health' },
}

export type HealthProfile = {
  age: string; weightKg: string; heightCm: string
  sleepGoal: string; waterGoal: string; conditions: string
}

export type Insight = { text: string; at: string } // at = ISO timestamp
const MAX_INSIGHTS = 10

// Tracks AI insights used in the current month, for the free-tier allowance.
export type AiUsage = { month: string; count: number }
const monthKey = () => new Date().toISOString().slice(0, 7) // "YYYY-MM"

const EMPTY_HEALTH: HealthProfile = {
  age: '', weightKg: '', heightCm: '', sleepGoal: '8', waterGoal: '8', conditions: '',
}

type State = {
  habits: Habit[]
  dark: boolean
  profileName: string
  health: HealthProfile
  notificationsEnabled: boolean
  onboarded: boolean
  goals: string[]
  insights: Insight[]
  addInsight: (text: string) => void
  clearInsights: () => void
  plus: boolean
  setPlus: (v: boolean) => void
  aiUsage: AiUsage
  recordAiUse: () => void
  paywallOpen: boolean
  openPaywall: () => void
  closePaywall: () => void
  completeOnboarding: (goals: string[]) => void
  addHabit: (h: NewHabit) => void
  updateHabit: (id: string, patch: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  toggleArchive: (id: string) => void
  toggleToday: (id: string) => void
  toggleDark: () => void
  setProfileName: (n: string) => void
  setHealth: (patch: Partial<HealthProfile>) => void
  setNotificationsEnabled: (v: boolean) => void
  clearAll: () => void
  resetAll: () => void
  seedDemo: () => void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      habits: [],
      dark: false,
      profileName: '',
      health: EMPTY_HEALTH,
      notificationsEnabled: true,
      onboarded: false,
      goals: [],
      insights: [],
      addInsight: (text) =>
        set((s) => ({ insights: [{ text, at: new Date().toISOString() }, ...s.insights].slice(0, MAX_INSIGHTS) })),
      clearInsights: () => set({ insights: [] }),
      plus: false,
      setPlus: (v) => set({ plus: v }),
      aiUsage: { month: monthKey(), count: 0 },
      recordAiUse: () =>
        set((s) => {
          const m = monthKey()
          const count = s.aiUsage.month === m ? s.aiUsage.count + 1 : 1
          return { aiUsage: { month: m, count } }
        }),
      paywallOpen: false,
      openPaywall: () => set({ paywallOpen: true }),
      closePaywall: () => set({ paywallOpen: false }),
      completeOnboarding: (goals) =>
        set((s) => {
          const existing = new Set(s.habits.map((h) => h.name.toLowerCase()))
          const starters = goals
            .map((g) => STARTER[g])
            .filter((h): h is NewHabit => !!h && !existing.has(h.name.toLowerCase()))
            .map((h) => ({ id: uid(), createdAt: todayISO(), history: [], ...h }))
          return { onboarded: true, goals, habits: [...s.habits, ...starters] }
        }),
      toggleDark: () => set((s) => ({ dark: !s.dark })),
      setProfileName: (n) => set({ profileName: n }),
      setHealth: (patch) => set((s) => ({ health: { ...s.health, ...patch } })),
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      clearAll: () => set({ habits: [] }),
      addHabit: (h) =>
        set((s) => ({ habits: [...s.habits, { id: uid(), createdAt: todayISO(), history: [], ...h }] })),
      updateHabit: (id, patch) =>
        set((s) => ({ habits: s.habits.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((x) => x.id !== id) })),
      toggleArchive: (id) =>
        set((s) => ({ habits: s.habits.map((x) => (x.id === id ? { ...x, archived: !x.archived } : x)) })),
      toggleToday: (id) =>
        set((s) => ({
          habits: s.habits.map((x) => {
            if (x.id !== id) return x
            const t = todayISO()
            const has = x.history.includes(t)
            return { ...x, history: has ? x.history.filter((d) => d !== t) : [...x.history, t].sort() }
          }),
        })),
      seedDemo: () =>
        set((s) => {
          const existing = new Set(s.habits.map((h) => h.name.toLowerCase()))
          const extra = SEED.filter((h) => !existing.has(h.name.toLowerCase()))
          return { habits: [...s.habits, ...extra] }
        }),
      resetAll: () => set({ habits: SEED }),
    }),
    { name: 'vitalis-habits-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
)
