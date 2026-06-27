import 'react-native-url-polyfill/auto'
import { Platform } from 'react-native'
import { createClient } from '@supabase/supabase-js'
import { secureAuthStorage } from './secureStorage'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

// True only when real credentials are present (not the placeholder defaults).
export const isConfigured =
  !!url && !!anonKey && !url.includes('YOUR_PROJECT') && !anonKey.includes('YOUR_ANON')

// A client is always created (with safe fallbacks) so imports never crash;
// it simply won't reach a real backend until you add your keys to .env.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: secureAuthStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Web completes the OAuth redirect in-page; native handles it manually.
      detectSessionInUrl: Platform.OS === 'web',
    },
  },
)
