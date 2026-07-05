import { Share } from 'react-native'
import { exportData } from '../src/export'
import { useStore } from '../src/store'

describe('exportData', () => {
  beforeEach(() => {
    useStore.getState().resetAll()
    useStore.setState({ profileName: 'Sam', goals: ['Fitness'], insights: [] })
  })

  it('shares a JSON snapshot of all local data', async () => {
    const spy = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: Share.sharedAction } as never)

    const res = await exportData()
    expect(res.ok).toBe(true)
    expect(spy).toHaveBeenCalledTimes(1)

    // The shared message must be valid JSON carrying the user's data.
    const arg = spy.mock.calls[0][0] as { message: string }
    const parsed = JSON.parse(arg.message)
    expect(parsed.app).toBe('Vitalis')
    expect(parsed.profileName).toBe('Sam')
    expect(parsed.goals).toEqual(['Fitness'])
    expect(Array.isArray(parsed.habits)).toBe(true)
    expect(parsed.habits.length).toBeGreaterThan(0)

    spy.mockRestore()
  })

  it('reports not-ok when the user dismisses the share sheet', async () => {
    const spy = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: Share.dismissedAction } as never)

    const res = await exportData()
    expect(res.ok).toBe(false)

    spy.mockRestore()
  })
})
