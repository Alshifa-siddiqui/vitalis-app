import { Share } from 'react-native'
import { useStore } from './store'

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
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Export failed.' }
  }
}
