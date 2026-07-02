import { useState } from 'react'
import { ScrollView, View, Text, Pressable, TextInput, StyleSheet, ActivityIndicator, KeyboardTypeOptions } from 'react-native'
import { cardShadow, FONT, type Palette } from '../theme'
import { useColors } from '../useColors'
import { Header, PrimaryButton } from '../ui'
import { useStore } from '../store'
import { useAuth } from '../auth'
import { computeStats } from '../streaks'

type Sub = 'main' | 'edit' | 'health' | 'notifications' | 'privacy' | 'changepw' | 'changeemail'

function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  const C = useColors()
  return (
    <Pressable onPress={onPress} accessibilityRole="switch" accessibilityState={{ checked: on }}
      style={{ width: 46, height: 26, borderRadius: 13, padding: 3, justifyContent: 'center',
        backgroundColor: on ? C.primary : C.muted + '55', alignItems: on ? 'flex-end' : 'flex-start' }}>
      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' }} />
    </Pressable>
  )
}

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const C = useColors()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <Pressable onPress={onBack} hitSlop={10}><Text style={{ color: C.primary, fontSize: 26 }}>‹</Text></Pressable>
      <Text style={{ fontFamily: FONT.display, fontSize: 25, color: C.forest }}>{title}</Text>
    </View>
  )
}

function Field({ label, value, onChangeText, keyboardType, placeholder, secureTextEntry, autoCapitalize }:
  { label: string; value: string; onChangeText: (t: string) => void; keyboardType?: KeyboardTypeOptions; placeholder?: string; secureTextEntry?: boolean; autoCapitalize?: 'none' | 'sentences' }) {
  const C = useColors()
  const s = makeStyles(C)
  return (
    <>
      <Text style={s.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType}
        secureTextEntry={secureTextEntry} autoCapitalize={autoCapitalize}
        placeholder={placeholder} placeholderTextColor={C.muted} style={s.input} />
    </>
  )
}

export default function Profile() {
  const C = useColors()
  const s = makeStyles(C)
  const [sub, setSub] = useState<Sub>('main')

  const habits = useStore((st) => st.habits)
  const dark = useStore((st) => st.dark)
  const toggleDark = useStore((st) => st.toggleDark)
  const profileName = useStore((st) => st.profileName)
  const notificationsEnabled = useStore((st) => st.notificationsEnabled)
  const setNotificationsEnabled = useStore((st) => st.setNotificationsEnabled)
  const clearAll = useStore((st) => st.clearAll)
  const seedDemo = useStore((st) => st.seedDemo)
  const { user, signOut, configured } = useAuth()

  if (sub === 'edit') return <EditProfile onBack={() => setSub('main')} />
  if (sub === 'health') return <HealthScreen onBack={() => setSub('main')} />
  if (sub === 'notifications') {
    return (
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <SubHeader title="Notifications" onBack={() => setSub('main')} />
        <View style={[s.menu, s.menuRow]}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ color: C.ink, fontSize: 15, fontFamily: FONT.medium }}>Habit reminders</Text>
            <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Daily reminders for habits with a set time.</Text>
          </View>
          <Toggle on={notificationsEnabled} onPress={() => setNotificationsEnabled(!notificationsEnabled)} />
        </View>
        <Text style={{ color: C.muted, fontSize: 12, marginTop: 12, fontFamily: FONT.medium }}>
          Set each habit's reminder time when you add or edit it. Turning this off cancels all scheduled reminders.
        </Text>
      </ScrollView>
    )
  }
  if (sub === 'privacy') return <PrivacyScreen onBack={() => setSub('main')} onClear={clearAll} onSeed={seedDemo} configured={configured} />
  if (sub === 'changepw') return <ChangePassword onBack={() => setSub('main')} />
  if (sub === 'changeemail') return <ChangeEmail onBack={() => setSub('main')} />

  // MAIN
  const totalCheckins = habits.reduce((a, h) => a + computeStats(h.history, h.frequency).completedCount, 0)
  const since = habits.reduce<string | null>((min, h) => (!min || h.createdAt < min ? h.createdAt : min), null)
  const displayName = profileName || (user?.email ? user.email.split('@')[0] : 'Guest')
  const statusLine = user?.email ?? (configured ? 'Not signed in' : 'Demo mode · backend not connected')
  const menu: { label: string; go: Sub }[] = [
    { label: 'Edit profile', go: 'edit' },
    { label: 'Health profile', go: 'health' },
    { label: 'Notifications', go: 'notifications' },
    ...(user ? ([{ label: 'Change password', go: 'changepw' }, { label: 'Change email', go: 'changeemail' }] as { label: string; go: Sub }[]) : []),
    { label: 'Privacy & data', go: 'privacy' },
  ]

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <Header title="Profile" />

      <View style={s.card}>
        <View style={s.avatar}><Text style={{ color: C.white, fontSize: 28, fontFamily: FONT.display }}>{displayName[0].toUpperCase()}</Text></View>
        <Text style={s.name}>{displayName}</Text>
        <Text style={{ color: C.muted, marginTop: 2, fontFamily: FONT.medium }}>{statusLine}</Text>
        <View style={s.statsRow}>
          <View style={s.stat}><Text style={s.statV}>{habits.length}</Text><Text style={s.statL}>Habits</Text></View>
          <View style={s.divider} />
          <View style={s.stat}><Text style={s.statV}>{totalCheckins}</Text><Text style={s.statL}>Check-ins</Text></View>
          <View style={s.divider} />
          <View style={s.stat}><Text style={s.statV}>{since ?? '—'}</Text><Text style={s.statL}>Since</Text></View>
        </View>
      </View>

      <Text style={s.section}>Appearance</Text>
      <Pressable style={[s.menu, s.menuRow]} onPress={toggleDark}>
        <Text style={{ color: C.ink, fontSize: 15, fontFamily: FONT.medium }}>🌙  Dark mode</Text>
        <Toggle on={dark} onPress={toggleDark} />
      </Pressable>

      <Text style={s.section}>Account</Text>
      <View style={s.menu}>
        {menu.map((m) => (
          <Pressable key={m.label} style={s.menuRow} onPress={() => setSub(m.go)}>
            <Text style={{ color: C.ink, fontSize: 15, fontFamily: FONT.medium }}>{m.label}</Text>
            <Text style={{ color: C.muted }}>›</Text>
          </Pressable>
        ))}
        {user && (
          <Pressable style={s.menuRow} onPress={signOut}>
            <Text style={{ color: C.error, fontSize: 15, fontFamily: FONT.semibold }}>Sign out</Text>
            <Text style={{ color: C.muted }}>›</Text>
          </Pressable>
        )}
      </View>
      <Text style={{ color: C.muted, fontSize: 12, marginTop: 10, fontFamily: FONT.medium }}>
        {configured ? 'Your habits sync securely to your account.' : 'Add Supabase keys to .env to enable accounts and secure cloud sync.'}
      </Text>
    </ScrollView>
  )
}

function EditProfile({ onBack }: { onBack: () => void }) {
  const C = useColors()
  const s = makeStyles(C)
  const profileName = useStore((st) => st.profileName)
  const setProfileName = useStore((st) => st.setProfileName)
  const [name, setName] = useState(profileName)
  const save = () => { setProfileName(name.trim()); onBack() }
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      <SubHeader title="Edit Profile" onBack={onBack} />
      <View style={s.card2}>
        <Field label="Display name" value={name} onChangeText={setName} placeholder="Your name" />
        <View style={{ height: 18 }} />
        <PrimaryButton label="Save" onPress={save} />
      </View>
    </ScrollView>
  )
}

function HealthScreen({ onBack }: { onBack: () => void }) {
  const C = useColors()
  const s = makeStyles(C)
  const health = useStore((st) => st.health)
  const setHealth = useStore((st) => st.setHealth)
  const [f, setF] = useState(health)
  const upd = (k: keyof typeof f) => (t: string) => setF((p) => ({ ...p, [k]: t }))
  const save = () => { setHealth(f); onBack() }
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      <SubHeader title="Health Profile" onBack={onBack} />
      <View style={s.card2}>
        <Field label="Age" value={f.age} onChangeText={upd('age')} keyboardType="numeric" placeholder="e.g. 25" />
        <Field label="Weight (kg)" value={f.weightKg} onChangeText={upd('weightKg')} keyboardType="numeric" placeholder="e.g. 70" />
        <Field label="Height (cm)" value={f.heightCm} onChangeText={upd('heightCm')} keyboardType="numeric" placeholder="e.g. 170" />
        <Field label="Sleep goal (hrs)" value={f.sleepGoal} onChangeText={upd('sleepGoal')} keyboardType="numeric" placeholder="8" />
        <Field label="Water goal (glasses)" value={f.waterGoal} onChangeText={upd('waterGoal')} keyboardType="numeric" placeholder="8" />
        <Field label="Health notes / conditions" value={f.conditions} onChangeText={upd('conditions')} placeholder="Optional" />
        <View style={{ height: 18 }} />
        <PrimaryButton label="Save" onPress={save} />
      </View>
      <Text style={{ color: C.muted, fontSize: 12, marginTop: 12, fontFamily: FONT.medium }}>
        ⚠️  For general wellness only — not medical advice. Stored privately on your account.
      </Text>
    </ScrollView>
  )
}

function PrivacyScreen({ onBack, onClear, onSeed, configured }: { onBack: () => void; onClear: () => void; onSeed: () => void; configured: boolean }) {
  const C = useColors()
  const s = makeStyles(C)
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const handle = () => {
    if (!confirm) { setConfirm(true); return }
    onClear(); setConfirm(false); setDone(true)
  }
  const seed = () => { onSeed(); setSeeded(true) }
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      <SubHeader title="Privacy & Data" onBack={onBack} />
      <View style={s.card2}>
        <Text style={{ color: C.ink, fontSize: 14, lineHeight: 21, fontFamily: FONT.medium }}>
          🔒  Your data is private. {configured
            ? 'Habits are protected by row-level security — only you can read or change them.'
            : 'Running in demo mode; data stays on this device.'}
        </Text>
      </View>

      <Text style={s.section}>Sample data</Text>
      {seeded
        ? <Text style={{ color: C.success, fontFamily: FONT.semibold, fontSize: 14 }}>✓ Sample habits added.</Text>
        : <PrimaryButton label="Load sample habits" onPress={seed} variant="ghost" />}
      <Text style={{ color: C.muted, fontSize: 12, marginTop: 10, fontFamily: FONT.medium }}>
        Adds a few example habits with history so you can explore the app. Won't duplicate ones you already have.
      </Text>

      <Text style={s.section}>Danger zone</Text>
      {done
        ? <Text style={{ color: C.success, fontFamily: FONT.semibold, fontSize: 14 }}>✓ All habit data deleted.</Text>
        : <PrimaryButton label={confirm ? 'Tap again to permanently delete' : 'Delete all habit data'} onPress={handle} variant="danger" />}
      <Text style={{ color: C.muted, fontSize: 12, marginTop: 12, fontFamily: FONT.medium }}>
        This clears your habits and check-ins everywhere. To delete your whole account, sign out and contact support.
      </Text>
    </ScrollView>
  )
}

function ChangePassword({ onBack }: { onBack: () => void }) {
  const C = useColors()
  const s = makeStyles(C)
  const { updatePassword } = useAuth()
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const save = async () => {
    setErr(''); setMsg('')
    if (pw.length < 6) return setErr('Password must be at least 6 characters.')
    setBusy(true); const res = await updatePassword(pw); setBusy(false)
    if (res.error) return setErr(res.error)
    setPw(''); setMsg('Password updated.')
  }
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      <SubHeader title="Change Password" onBack={onBack} />
      <View style={s.card2}>
        <Field label="New password" value={pw} onChangeText={setPw} placeholder="••••••••" secureTextEntry autoCapitalize="none" />
        {err ? <Text style={{ color: C.error, fontFamily: FONT.medium, fontSize: 13, marginTop: 10 }}>{err}</Text> : null}
        {msg ? <Text style={{ color: C.success, fontFamily: FONT.semibold, fontSize: 13, marginTop: 10 }}>{msg}</Text> : null}
        <View style={{ height: 16 }} />
        {busy ? <ActivityIndicator color={C.primary} /> : <PrimaryButton label="Update password" onPress={save} />}
      </View>
    </ScrollView>
  )
}

function ChangeEmail({ onBack }: { onBack: () => void }) {
  const C = useColors()
  const s = makeStyles(C)
  const { updateEmail, user } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const save = async () => {
    setErr(''); setMsg('')
    if (!email.trim().includes('@')) return setErr('Enter a valid email.')
    setBusy(true); const res = await updateEmail(email.trim()); setBusy(false)
    if (res.error) return setErr(res.error)
    setMsg('Confirmation sent. Check your new inbox to finish the change.')
  }
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
      <SubHeader title="Change Email" onBack={onBack} />
      <View style={s.card2}>
        <Text style={{ color: C.muted, fontSize: 13, marginBottom: 8, fontFamily: FONT.medium }}>Current: {user?.email ?? '—'}</Text>
        <Field label="New email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" />
        {err ? <Text style={{ color: C.error, fontFamily: FONT.medium, fontSize: 13, marginTop: 10 }}>{err}</Text> : null}
        {msg ? <Text style={{ color: C.success, fontFamily: FONT.semibold, fontSize: 13, marginTop: 10 }}>{msg}</Text> : null}
        <View style={{ height: 16 }} />
        {busy ? <ActivityIndicator color={C.primary} /> : <PrimaryButton label="Update email" onPress={save} />}
      </View>
    </ScrollView>
  )
}

const makeStyles = (C: Palette) => StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: 24, padding: 24, alignItems: 'center', ...cardShadow },
  card2: { backgroundColor: C.card, borderRadius: 20, padding: 18, ...cardShadow },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: FONT.display, fontSize: 23, color: C.forest, marginTop: 12, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  stat: { alignItems: 'center', paddingHorizontal: 18 },
  statV: { fontFamily: FONT.mono, fontSize: 18, color: C.primary },
  statL: { fontSize: 12, fontFamily: FONT.medium, color: C.muted, marginTop: 2 },
  divider: { width: 1, height: 36, backgroundColor: C.muted + '33' },
  section: { fontFamily: FONT.display, fontSize: 19, color: C.forest, marginTop: 24, marginBottom: 12 },
  menu: { backgroundColor: C.card, borderRadius: 18, overflow: 'hidden', ...cardShadow },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.muted + '22' },
  label: { fontSize: 13, fontFamily: FONT.bold, color: C.muted, marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: C.canvas, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontFamily: FONT.sans, color: C.ink, borderWidth: 1, borderColor: C.muted + '33' },
})
