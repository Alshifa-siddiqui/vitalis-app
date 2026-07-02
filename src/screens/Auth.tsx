import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { FONT, cardShadow, type Palette } from '../theme'
import { useColors } from '../useColors'
import { PrimaryButton } from '../ui'
import { useAuth } from '../auth'

type Mode = 'in' | 'up' | 'forgot'

export default function Auth({ onDemo }: { onDemo: () => void }) {
  const C = useColors()
  const s = makeStyles(C)
  const { signIn, signUp, signInWithProvider, resetPasswordForEmail, resendConfirmation, configured } = useAuth()
  const [mode, setMode] = useState<Mode>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [resendEmail, setResendEmail] = useState('')

  const reset = () => { setError(''); setNotice('') }
  const go = (m: Mode) => { setMode(m); reset(); setResendEmail('') }

  const submit = async () => {
    reset()
    if (mode === 'forgot') {
      if (!email.trim()) return setError('Enter your email.')
      setBusy(true)
      const res = await resetPasswordForEmail(email.trim())
      setBusy(false)
      if (res.error) return setError(res.error)
      return setNotice('Check your email for a password reset link.')
    }
    if (!email.trim() || !password) return setError('Enter your email and password.')
    if (mode === 'up' && password.length < 6) return setError('Password must be at least 6 characters.')
    setBusy(true)
    const res = mode === 'in' ? await signIn(email.trim(), password) : await signUp(email.trim(), password)
    setBusy(false)
    if (res.error) return setError(res.error)
    if (mode === 'up' && 'needsConfirm' in res && res.needsConfirm) {
      setNotice('Account created! Check your email to confirm, then sign in.')
      setResendEmail(email.trim())
      setMode('in')
    }
  }

  const resend = async () => {
    reset()
    const res = await resendConfirmation(resendEmail)
    if (res.error) setError(res.error)
    else setNotice('Confirmation email resent.')
  }

  const social = async () => {
    reset()
    const res = await signInWithProvider('google')
    if (res.error) setError(res.error)
  }

  const title = mode === 'in' ? 'Welcome back' : mode === 'up' ? 'Create your account' : 'Reset password'
  const cta = mode === 'in' ? 'Sign In' : mode === 'up' ? 'Sign Up' : 'Send reset link'

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <View style={s.logo}><Text style={{ fontSize: 34 }}>🌿</Text></View>
      <Text style={s.brand}>Vitalis</Text>
      <Text style={s.tagline}>Your health journey, every day.</Text>

      <View style={s.card}>
        <Text style={s.title}>{title}</Text>
        {mode === 'forgot' && <Text style={{ color: C.muted, fontSize: 13, marginBottom: 4 }}>We'll email you a link to set a new password.</Text>}

        <Text style={s.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="you@email.com" placeholderTextColor={C.muted}
          autoCapitalize="none" keyboardType="email-address" style={s.input} />

        {mode !== 'forgot' && (
          <>
            <Text style={s.label}>Password</Text>
            <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={C.muted}
              secureTextEntry style={s.input} />
          </>
        )}

        {error ? <Text style={s.error}>{error}</Text> : null}
        {notice ? <Text style={s.notice}>{notice}</Text> : null}
        {resendEmail && mode === 'in' ? (
          <Pressable onPress={resend}><Text style={[s.notice, { textDecorationLine: 'underline' }]}>Resend confirmation email</Text></Pressable>
        ) : null}

        <View style={{ height: 14 }} />
        {busy ? <ActivityIndicator color={C.primary} /> : <PrimaryButton label={cta} onPress={submit} />}

        {mode === 'in' && (
          <Pressable onPress={() => go('forgot')} style={{ marginTop: 14 }}>
            <Text style={s.switch}>Forgot password?</Text>
          </Pressable>
        )}

        <Pressable onPress={() => go(mode === 'up' ? 'in' : mode === 'forgot' ? 'in' : 'up')} style={{ marginTop: mode === 'in' ? 8 : 14 }}>
          <Text style={s.switch}>
            {mode === 'in' ? 'New here?  Create an account' : mode === 'up' ? 'Already have an account?  Sign in' : '‹ Back to sign in'}
          </Text>
        </Pressable>

        {mode !== 'forgot' && (
          <>
            <View style={s.divider}><View style={s.line} /><Text style={s.or}>or</Text><View style={s.line} /></View>
            <Pressable style={s.social} onPress={social} accessibilityRole="button" accessibilityLabel="Continue with Google">
              <Text style={s.socialText}>Continue with Google</Text>
            </Pressable>
          </>
        )}
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

const makeStyles = (C: Palette) => StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: C.canvas },
  logo: { width: 70, height: 70, borderRadius: 22, backgroundColor: C.lightmint, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  brand: { fontFamily: FONT.displayXL, fontSize: 34, color: C.forest, textAlign: 'center', marginTop: 12 },
  tagline: { fontFamily: FONT.sans, fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  card: { backgroundColor: C.card, borderRadius: 24, padding: 22, ...cardShadow },
  title: { fontFamily: FONT.display, fontSize: 21, color: C.forest, marginBottom: 8 },
  label: { fontSize: 13, fontFamily: FONT.bold, color: C.muted, marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: C.canvas, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontFamily: FONT.sans, color: C.ink, borderWidth: 1, borderColor: C.muted + '33' },
  error: { color: C.error, fontFamily: FONT.medium, fontSize: 13, marginTop: 12 },
  notice: { color: C.mid, fontFamily: FONT.semibold, fontSize: 13, marginTop: 12 },
  switch: { color: C.primary, fontFamily: FONT.semibold, fontSize: 14, textAlign: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: C.muted + '33' },
  or: { marginHorizontal: 12, color: C.muted, fontFamily: FONT.medium, fontSize: 13 },
  social: { borderWidth: 1.5, borderColor: C.muted + '44', borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  socialText: { fontFamily: FONT.semibold, fontSize: 15, color: C.ink },
  demo: { marginTop: 22, alignItems: 'center' },
  demoText: { color: C.muted, fontFamily: FONT.medium, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  demoLink: { color: C.primary, fontFamily: FONT.bold, fontSize: 14, marginTop: 10 },
})
