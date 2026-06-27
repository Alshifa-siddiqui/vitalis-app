import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isConfigured } from './supabase'

type AuthValue = {
  session: Session | null
  user: User | null
  loading: boolean
  configured: boolean
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signInWithProvider: (provider: 'google' | 'apple') => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const value: AuthValue = {
    session,
    user: session?.user ?? null,
    loading,
    configured: isConfigured,
    signUp: async (email, password) => {
      const { error } = await supabase.auth.signUp({ email, password })
      return error ? { error: error.message } : {}
    },
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error ? { error: error.message } : {}
    },
    signInWithProvider: async (provider) => {
      const { error } = await supabase.auth.signInWithOAuth({ provider })
      return error ? { error: error.message } : {}
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
