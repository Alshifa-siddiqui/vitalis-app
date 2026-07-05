import { Share } from 'react-native'
import { useStore } from './store'
import { log } from './log'

// Bundles all local data into a portable JSON snapshot the user can save or
// send elsewhere. Uses the built-in Share sheet (no extra native deps).
export async function exportData(): Promise<{ ok: boolean; error?: string }> {
  try {
    const { habits, profileName, health, goals, insights } = useStore.getState()
    const snapshot = {
      app: 'Vitalis',
      exportedAt: new Date().toISOString(),
      version: 1,
      profileName,
      goals,
      health,
      habits,
      insights,
    }
    const json = JSON.stringify(snapshot, null, 2)
    const result = await Share.share({
      title: 'Vitalis data export',
      message: json,
    })
    if (result.action === Share.dismissedAction) return { ok: false }
    log.event('data_exported', { habitCount: snapshot.habits.length })
    return { ok: true }
  } catch (e) {
    log.error(e, { where: 'exportData' })
    return { ok: false, error: e instanceof Error ? e.message : 'Export failed.' }
  }
}
