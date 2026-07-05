import * as Sentry from '@sentry/react-native'
import { log } from '../src/log'

describe('log', () => {
  afterEach(() => jest.clearAllMocks())

  it('records an event as a Sentry breadcrumb', () => {
    log.event('habit_checked_in', { category: 'Fitness' })
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'event', message: 'habit_checked_in' }),
    )
  })

  it('reports errors via captureException, wrapping non-Error values', () => {
    log.error('boom', { where: 'test' })
    expect(Sentry.captureException).toHaveBeenCalledTimes(1)
    const arg = (Sentry.captureException as jest.Mock).mock.calls[0][0]
    expect(arg).toBeInstanceOf(Error)
    expect(arg.message).toBe('boom')
  })
})
