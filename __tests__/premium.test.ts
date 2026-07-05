import { aiInsightsLeft, canAddHabit, FREE_HABIT_LIMIT, FREE_AI_PER_MONTH } from '../src/premium'

const thisMonth = new Date().toISOString().slice(0, 7)

describe('canAddHabit', () => {
  it('lets free users add up to the limit, then blocks', () => {
    expect(canAddHabit(false, FREE_HABIT_LIMIT - 1)).toBe(true)
    expect(canAddHabit(false, FREE_HABIT_LIMIT)).toBe(false)
  })
  it('never blocks Plus members', () => {
    expect(canAddHabit(true, 999)).toBe(true)
  })
})

describe('aiInsightsLeft', () => {
  it('is unlimited for Plus', () => {
    expect(aiInsightsLeft(true, { month: thisMonth, count: 100 })).toBe(Infinity)
  })
  it('counts down within the current month', () => {
    expect(aiInsightsLeft(false, { month: thisMonth, count: 1 })).toBe(FREE_AI_PER_MONTH - 1)
    expect(aiInsightsLeft(false, { month: thisMonth, count: FREE_AI_PER_MONTH })).toBe(0)
    expect(aiInsightsLeft(false, { month: thisMonth, count: 99 })).toBe(0)
  })
  it('resets when the stored month is stale', () => {
    expect(aiInsightsLeft(false, { month: '2000-01', count: 99 })).toBe(FREE_AI_PER_MONTH)
  })
})
