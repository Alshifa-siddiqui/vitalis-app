import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator } from 'react-native'
import { FONT, cardShadow, type Palette } from '../theme'
import { useColors } from '../useColors'
import { PrimaryButton } from '../ui'
import { useAuth } from '../auth'

export default function SetNewPassword() {
  const C = useColors()
  const s = makeStyles(C)
  const { updatePassword } = useAuth()
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    setError('')
    if (pw.length < 6) return setError('Password must be at least 6 characters.')
    setBusy(true)
    const res = await updatePassword(pw)
    setBusy(false)
    if (res.error) setError(res.error)
    // On success, recovery state clears in the provider and the app continues.
  }

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <View style={s.logo}><Text style={{ fontSize: 34 }}>🌿</Text></View>
      <Text style={s.brand}>Set a new password</Text>
      <View style={s.card}>
        <Text style={s.label}>New password</Text>
        <TextInput value={pw} onChangeText={setPw} secureTextEntry placeholder="••••••••"
          placeholderTextColor={C.muted} style={s.input} />
        {error ? <Text style={s.error}>{error}</Text> : null}
        <View style={{ height: 16 }} />
        {busy ? <ActivityIndicator color={C.primary} /> : <PrimaryButton label="Update password" onPress={save} />}
      </View>
    </ScrollView>
  )
}

const makeStyles = (C: Palette) => StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: C.canvas },
  logo: { width: 70, height: 70, borderRadius: 22, backgroundColor: C.lightmint, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  brand: { fontFamily: FONT.display, fontSize: 24, color: C.forest, textAlign: 'center', marginTop: 14, marginBottom: 22 },
  card: { backgroundColor: C.card, borderRadius: 24, padding: 22, ...cardShadow },
  label: { fontSize: 13, fontFamily: FONT.bold, color: C.muted, marginBottom: 6 },
  input: { backgroundColor: C.canvas, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontFamily: FONT.sans, color: C.ink, borderWidth: 1, borderColor: C.muted + '33' },
  error: { color: C.error, fontFamily: FONT.medium, fontSize: 13, marginTop: 12 },
})
