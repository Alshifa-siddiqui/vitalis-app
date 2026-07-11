import { computeStats, isDoneToday, todayISO, GAP, BADGES, habitStrength } from '../src/streaks'

// ISO date `n` days before today (0 = today).
const iso = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

describe('todayISO', () => {
  it('is YYYY-MM-DD and equals iso(0)', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(todayISO()).toBe(iso(0))
  })
})

describe('habitStrength', () => {
  const range = (n: number) => Array.from({ length: n }, (_, i) => iso(i))
  it('is 0 with no history and ~100 when done every day', () => {
    expect(habitStrength([], 'daily')).toBe(0)
    expect(habitStrength(range(30), 'daily')).toBeGreaterThanOrEqual(99)
  })
  it('forgives a single recent miss (barely dents strength)', () => {
    const perfect = habitStrength(range(30), 'daily')
    const oneMiss = habitStrength(range(30).filter((d) => d !== iso(2)), 'daily')
    expect(oneMiss).toBeGreaterThan(85) // still strong
    expect(perfect - oneMiss).toBeLessThan(15) // a miss doesn't reset it
  })
  it('stays within 0–100', () => {
    const v = habitStrength(range(60), 'weekly')
    expect(v).toBeGreaterThanOrEqual(0)
    expect(v).toBeLessThanOrEqual(100)
  })
})

describe('isDoneToday', () => {
  it('true only when history includes today', () => {
    expect(isDoneToday([iso(0)])).toBe(true)
    expect(isDoneToday([iso(1), iso(2)])).toBe(false)
    expect(isDoneToday([])).toBe(false)
  })
})

describe('computeStats — daily', () => {
  it('counts a run of consecutive days ending today', () => {
    const s = computeStats([iso(2), iso(1), iso(0)], 'daily')
    expect(s.currentStreak).toBe(3)
    expect(s.completedCount).toBe(3)
    expect(s.longestStreak).toBe(3)
    expect(s.lastCompleted).toBe(iso(0))
  })

  it('resets current streak to 0 when the window has lapsed', () => {
    const s = computeStats([iso(5), iso(4), iso(3)], 'daily')
    expect(s.currentStreak).toBe(0)
    expect(s.longestStreak).toBe(3)
  })

  it('keeps the streak alive if last check-in was yesterday', () => {
    const s = computeStats([iso(2), iso(1)], 'daily')
    expect(s.currentStreak).toBe(2)
  })

  it('de-duplicates the completion count and handles gaps in longest', () => {
    const s = computeStats([iso(10), iso(9), iso(8), iso(5), iso(0), iso(0)], 'daily')
    expect(s.completedCount).toBe(5) // duplicate iso(0) counted once
    expect(s.longestStreak).toBe(3) // run of 10,9,8
  })

  it('returns zeros for empty history', () => {
    expect(computeStats([], 'daily')).toEqual({
      completedCount: 0, currentStreak: 0, longestStreak: 0, lastCompleted: null,
    })
  })
})

describe('computeStats — weekly/monthly gaps', () => {
  it('weekly allows a 7-day gap', () => {
    expect(GAP.weekly).toBe(7)
    const s = computeStats([iso(14), iso(7), iso(0)], 'weekly')
    expect(s.currentStreak).toBe(3)
  })
})

describe('BADGES', () => {
  it('First Flame needs one check-in; Week Warrior needs a 7-day streak', () => {
    const stats = computeStats([iso(6), iso(5), iso(4), iso(3), iso(2), iso(1), iso(0)], 'daily')
    const earned = BADGES.filter((b) => b.test(stats)).map((b) => b.name)
    expect(earned).toContain('First Flame')
    expect(earned).toContain('Week Warrior')
  })

  it('no badges for empty stats', () => {
    const stats = computeStats([], 'daily')
    expect(BADGES.filter((b) => b.test(stats))).toHaveLength(0)
  })
})
