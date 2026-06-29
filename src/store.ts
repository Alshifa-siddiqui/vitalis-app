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
  completeOnboarding: (goals: string[]) => void
  addHabit: (h: NewHabit) => void
  updateHabit: (id: string, patch: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  toggleToday: (id: string) => void
  toggleDark: () => void
  setProfileName: (n: string) => void
  setHealth: (patch: Partial<HealthProfile>) => void
  setNotificationsEnabled: (v: boolean) => void
  clearAll: () => void
  resetAll: () => void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      habits: SEED,
      dark: false,
      profileName: '',
      health: EMPTY_HEALTH,
      notificationsEnabled: true,
      onboarded: false,
      goals: [],
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
      toggleToday: (id) =>
        set((s) => ({
          habits: s.habits.map((x) => {
            if (x.id !== id) return x
            const t = todayISO()
            const has = x.history.includes(t)
            return { ...x, history: has ? x.history.filter((d) => d !== t) : [...x.history, t].sort() }
          }),
        })),
      resetAll: () => set({ habits: SEED }),
    }),
    { name: 'vitalis-habits-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
)
