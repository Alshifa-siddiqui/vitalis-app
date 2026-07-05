import * as Sentry from '@sentry/react-native'

// Lightweight logging + analytics layer.
//
// Everything funnels through Sentry (already configured) so we don't add a
// separate, privacy-invasive analytics SDK — consistent with our privacy policy
// (no third-party ad trackers). In local dev it just prints to the console.
//
// - `log.event` records a product analytics event (e.g. habit_checked_in) as a
//   Sentry breadcrumb, so when an error is later reported you can see the trail
//   of what the user did leading up to it.
// - `log.error` reports a handled error you want to know about.

type Props = Record<string, string | number | boolean | undefined>

const dev = typeof __DEV__ !== 'undefined' && __DEV__

export const log = {
  event(name: string, props: Props = {}) {
    if (dev) console.log(`[event] ${name}`, props)
    Sentry.addBreadcrumb({ category: 'event', message: name, level: 'info', data: props })
  },

  error(err: unknown, context: Props = {}) {
    if (dev) console.error('[error]', err, context)
    const e = err instanceof Error ? err : new Error(String(err))
    Sentry.captureException(e, { extra: context })
  },
}
