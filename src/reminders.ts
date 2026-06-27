import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import type { Habit } from './store'

// Show reminders even when the app is foregrounded (native only).
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  const current = await Notifications.getPermissionsAsync()
  if (current.granted) return true
  const requested = await Notifications.requestPermissionsAsync()
  return requested.granted
}

// Cancel all scheduled reminders and re-schedule one daily notification per
// habit that has a reminderTime. Called whenever habits change.
export async function syncReminders(habits: Habit[]): Promise<void> {
  if (Platform.OS === 'web') return
  const hasAny = habits.some((h) => h.reminderTime)
  if (!hasAny) {
    await Notifications.cancelAllScheduledNotificationsAsync()
    return
  }
  if (!(await ensureNotificationPermission())) return

  await Notifications.cancelAllScheduledNotificationsAsync()
  for (const h of habits) {
    if (!h.reminderTime) continue
    const [hh, mm] = h.reminderTime.split(':').map(Number)
    if (Number.isNaN(hh) || Number.isNaN(mm)) continue
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Vitalis',
        body: `Time for "${h.name}" — keep your streak alive!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hh,
        minute: mm,
      },
    })
  }
}
