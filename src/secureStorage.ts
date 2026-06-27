import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

// Auth-session storage adapter for Supabase.
// - Web: AsyncStorage (no SecureStore on web).
// - Native: expo-secure-store (iOS Keychain / Android Keystore). SecureStore
//   caps values at ~2KB, so large sessions are transparently chunked.
const CHUNK = 1800
const isWeb = Platform.OS === 'web'

export const secureAuthStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) return AsyncStorage.getItem(key)
    const head = await SecureStore.getItemAsync(key)
    if (head === null) return null
    if (!head.startsWith('__chunks__:')) return head
    const n = parseInt(head.split(':')[1], 10)
    let out = ''
    for (let i = 0; i < n; i++) out += (await SecureStore.getItemAsync(`${key}.${i}`)) ?? ''
    return out
  },
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) return AsyncStorage.setItem(key, value)
    if (value.length <= CHUNK) {
      await SecureStore.setItemAsync(key, value)
      return
    }
    const n = Math.ceil(value.length / CHUNK)
    await SecureStore.setItemAsync(key, `__chunks__:${n}`)
    for (let i = 0; i < n; i++) {
      await SecureStore.setItemAsync(`${key}.${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK))
    }
  },
  async removeItem(key: string): Promise<void> {
    if (isWeb) return AsyncStorage.removeItem(key)
    const head = await SecureStore.getItemAsync(key)
    await SecureStore.deleteItemAsync(key)
    if (head?.startsWith('__chunks__:')) {
      const n = parseInt(head.split(':')[1], 10)
      for (let i = 0; i < n; i++) await SecureStore.deleteItemAsync(`${key}.${i}`)
    }
  },
}
