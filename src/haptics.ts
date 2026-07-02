import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'

// Light tap on interaction; success buzz on a milestone. No-ops on web.
export function tapFeedback() {
  if (Platform.OS === 'web') return
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
}

export function successFeedback() {
  if (Platform.OS === 'web') return
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
}
