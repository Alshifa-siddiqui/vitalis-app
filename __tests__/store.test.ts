import { useStore } from '../src/store'
import { isDoneToday, todayISO } from '../src/streaks'

const get = () => useStore.getState()

beforeEach(() => {
  get().resetAll() // back to the seed habits
  useStore.setState({ onboarded: false, goals: [], profileName: '', insights: [] })
})

describe('habit CRUD', () => {
  it('adds a habit with empty history', () => {
    const before = get().habits.length
    get().addHabit({ name: 'Stretch', icon: '🤸', frequency: 'daily', category: 'Fitness' })
    const habits = get().habits
    expect(habits.length).toBe(before + 1)
    const added = habits.find((h) => h.name === 'Stretch')!
    expect(added.history).toEqual([])
    expect(added.id).toBeTruthy()
  })

  it('updates and deletes a habit', () => {
    get().addHabit({ name: 'Temp', icon: '✅', frequency: 'daily', category: 'General' })
    const id = get().habits.find((h) => h.name === 'Temp')!.id
    get().updateHabit(id, { name: 'Renamed', frequency: 'weekly' })
    const h = get().habits.find((x) => x.id === id)!
    expect(h.name).toBe('Renamed')
    expect(h.frequency).toBe('weekly')
    get().deleteHabit(id)
    expect(get().habits.find((x) => x.id === id)).toBeUndefined()
  })

  it('clearAll empties habits', () => {
    get().clearAll()
    expect(get().habits).toEqual([])
  })
})

describe('toggleToday', () => {
  it('checks in today, then unchecks', () => {
    const id = get().habits[0].id
    const wasDone = isDoneToday(get().habits[0].history)
    get().toggleToday(id)
    expect(isDoneToday(get().habits.find((h) => h.id === id)!.history)).toBe(!wasDone)
    get().toggleToday(id)
    expect(isDoneToday(get().habits.find((h) => h.id === id)!.history)).toBe(wasDone)
  })

  it('records today in ISO form', () => {
    get().clearAll()
    get().addHabit({ name: 'X', icon: '✅', frequency: 'daily', category: 'General' })
    const id = get().habits[0].id
    get().toggleToday(id)
    expect(get().habits[0].history).toContain(todayISO())
  })
})

describe('seedDemo', () => {
  it('adds sample habits without duplicating existing ones', () => {
    get().clearAll()
    get().addHabit({ name: 'Morning Run', icon: '🏃', frequency: 'daily', category: 'Fitness' })
    get().seedDemo()
    const names = get().habits.map((h) => h.name)
    expect(names.filter((n) => n === 'Morning Run').length).toBe(1) // not duplicated
    expect(names).toContain('Meditation') // a fresh sample was added
  })
})

describe('workouts', () => {
  it('logs a workout dated today and can delete it', () => {
    useStore.setState({ workouts: [] })
    get().addWorkout('Strength', 45)
    const w = get().workouts
    expect(w.length).toBe(1)
    expect(w[0].type).toBe('Strength')
    expect(w[0].minutes).toBe(45)
    expect(w[0].date).toBe(todayISO())
    get().deleteWorkout(w[0].id)
    expect(get().workouts).toEqual([])
  })
})

describe('insights', () => {
  it('prepends new insights and caps the history at 10', () => {
    for (let i = 0; i < 12; i++) get().addInsight(`insight ${i}`)
    const insights = get().insights
    expect(insights.length).toBe(10)
    expect(insights[0].text).toBe('insight 11') // newest first
    expect(insights[0].at).toBeTruthy()
    get().clearInsights()
    expect(get().insights).toEqual([])
  })
})

describe('completeOnboarding', () => {
  it('sets goals + onboarded and seeds starter habits, skipping duplicates', () => {
    // Seed already contains "Drink Water" (Hydration goal) but not "Morning Workout" (Fitness).
    const before = get().habits.map((h) => h.name)
    get().completeOnboarding(['Fitness', 'Hydration'])
    const after = get().habits.map((h) => h.name)
    expect(get().onboarded).toBe(true)
    expect(get().goals).toEqual(['Fitness', 'Hydration'])
    expect(after).toContain('Morning Workout') // Fitness starter added
    // Hydration's "Drink Water" already existed → not duplicated
    expect(after.filter((n) => n === 'Drink Water').length).toBe(
      before.filter((n) => n === 'Drink Water').length,
    )
  })
})
