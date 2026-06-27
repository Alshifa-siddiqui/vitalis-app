import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { C, FONT, cardShadow } from '../theme'
import { PrimaryButton } from '../ui'
import { useAuth } from '../auth'

export default function Auth({ onDemo }: { onDemo: () => void }) {
  const { signIn, signUp, signInWithProvider, configured } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    if (!email.trim() || !password) return setError('Enter your email and password.')
    setBusy(true)
    const res = mode === 'in' ? await signIn(email.trim(), password) : await signUp(email.trim(), password)
    setBusy(false)
    if (res.error) setError(res.error)
  }

  const social = async (p: 'google' | 'apple') => {
    setError('')
    const res = await signInWithProvider(p)
    if (res.error) setError(res.error)
  }

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <View style={s.logo}><Text style={{ fontSize: 34 }}>🌿</Text></View>
      <Text style={s.brand}>Vitalis</Text>
      <Text style={s.tagline}>Your health journey, every day.</Text>

      <View style={s.card}>
        <Text style={s.title}>{mode === 'in' ? 'Welcome back' : 'Create your account'}</Text>

        <Text style={s.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="you@email.com" placeholderTextColor={C.muted}
          autoCapitalize="none" keyboardType="email-address" style={s.input} />

        <Text style={s.label}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={C.muted}
          secureTextEntry style={s.input} />

        {error ? <Text style={s.error}>{error}</Text> : null}

        <View style={{ height: 14 }} />
        {busy
          ? <ActivityIndicator color={C.primary} />
          : <PrimaryButton label={mode === 'in' ? 'Sign In' : 'Sign Up'} onPress={submit} />}

        <Pressable onPress={() => { setMode(mode === 'in' ? 'up' : 'in'); setError('') }} style={{ marginTop: 14 }}>
          <Text style={s.switch}>
            {mode === 'in' ? "New here?  Create an account" : 'Already have an account?  Sign in'}
          </Text>
        </Pressable>

        <View style={s.divider}><View style={s.line} /><Text style={s.or}>or</Text><View style={s.line} /></View>

        <Pressable style={s.social} onPress={() => social('google')}>
          <Text style={s.socialText}>continue with Google</Text>
        </Pressable>
        <Pressable style={[s.social, { backgroundColor: C.ink }]} onPress={() => social('apple')}>
          <Text style={[s.socialText, { color: C.white }]}> Continue with Apple</Text>
        </Pressable>
      </View>

      {!configured && (
        <View style={s.demo}>
          <Text style={s.demoText}>⚙️  Backend not connected yet. Add your Supabase keys to .env to enable real accounts.</Text>
          <Pressable onPress={onDemo}><Text style={s.demoLink}>Continue in demo mode →</Text></Pressable>
        </View>
      )}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: C.canvas },
  logo: { width: 70, height: 70, borderRadius: 22, backgroundColor: C.lightmint, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  brand: { fontFamily: FONT.displayXL, fontSize: 34, color: C.forest, textAlign: 'center', marginTop: 12 },
  tagline: { fontFamily: FONT.sans, fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  card: { backgroundColor: C.white, borderRadius: 24, padding: 22, ...cardShadow },
  title: { fontFamily: FONT.display, fontSize: 21, color: C.forest, marginBottom: 8 },
  label: { fontSize: 13, fontFamily: FONT.bold, color: C.muted, marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: C.canvas, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontFamily: FONT.sans, color: C.ink, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  error: { color: C.error, fontFamily: FONT.medium, fontSize: 13, marginTop: 12 },
  switch: { color: C.primary, fontFamily: FONT.semibold, fontSize: 14, textAlign: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  or: { marginHorizontal: 12, color: C.muted, fontFamily: FONT.medium, fontSize: 13 },
  social: { borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  socialText: { fontFamily: FONT.semibold, fontSize: 15, color: C.ink },
  demo: { marginTop: 22, alignItems: 'center' },
  demoText: { color: C.muted, fontFamily: FONT.medium, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  demoLink: { color: C.primary, fontFamily: FONT.bold, fontSize: 14, marginTop: 10 },
})
