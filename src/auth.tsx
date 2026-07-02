import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isConfigured } from './supabase'

// Lets the in-app browser dismiss itself after the OAuth redirect (web).
WebBrowser.maybeCompleteAuthSession()

type Result = { error?: string }

type AuthValue = {
  session: Session | null
  user: User | null
  loading: boolean
  configured: boolean
  recovering: boolean
  signUp: (email: string, password: string) => Promise<{ error?: string; needsConfirm?: boolean }>
  signIn: (email: string, password: string) => Promise<Result>
  signInWithProvider: (provider: 'google') => Promise<Result>
  resetPasswordForEmail: (email: string) => Promise<Result>
  resendConfirmation: (email: string) => Promise<Result>
  updatePassword: (password: string) => Promise<Result>
  updateEmail: (email: string) => Promise<Result>
  signOut: () => Promise<void>
  clearRecovering: () => void
}

const AuthContext = createContext<AuthValue | undefined>(undefined)

const resetRedirect = makeRedirectUri({ scheme: 'vitalis', path: 'auth/callback' })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value: AuthValue = {
    session,
    user: session?.user ?? null,
    loading,
    configured: isConfigured,
    recovering,
    clearRecovering: () => setRecovering(false),
    resetPasswordForEmail: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: resetRedirect })
      return error ? { error: error.message } : {}
    },
    resendConfirmation: async (email) => {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      return error ? { error: error.message } : {}
    },
    updatePassword: async (password) => {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) return { error: error.message }
      setRecovering(false)
      return {}
    },
    updateEmail: async (email) => {
      const { error } = await supabase.auth.updateUser({ email })
      return error ? { error: error.message } : {}
    },
    signUp: async (email, password) => {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return { error: error.message }
      // If email confirmation is on, no session is returned until confirmed.
      return { needsConfirm: !data.session }
    },
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error ? { error: error.message } : {}
    },
    signInWithProvider: async (provider) => {
      // Web: a normal full-page redirect handles everything.
      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({ provider })
        return error ? { error: error.message } : {}
      }
      // Native: open the provider in an in-app browser, then capture the
      // redirect back to our scheme and establish the session manually.
      const redirectTo = makeRedirectUri({ scheme: 'vitalis', path: 'auth/callback' })
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      })
      if (error) return { error: error.message }
      if (!data?.url) return { error: 'Could not start sign-in.' }
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      if (result.type !== 'success') return {} // user cancelled
      const { params, errorCode } = QueryParams.getQueryParams(result.url)
      if (errorCode) return { error: errorCode }
      const { access_token, refresh_token } = params
      if (!access_token) return { error: 'No session returned.' }
      const { error: sessErr } = await supabase.auth.setSession({ access_token, refresh_token })
      return sessErr ? { error: sessErr.message } : {}
    },
    signOut: async () => {
      await supabase.auth.signOut()
      setSession(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
