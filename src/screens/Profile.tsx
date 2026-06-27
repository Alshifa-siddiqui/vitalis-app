import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native'
import { cardShadow, FONT, type Palette } from '../theme'
import { useColors } from '../useColors'
import { Header, PrimaryButton } from '../ui'
import { useStore } from '../store'
import { useAuth } from '../auth'
import { computeStats } from '../streaks'

export default function Profile() {
  const C = useColors()
  const s = makeStyles(C)
  const habits = useStore((s) => s.habits)
  const resetAll = useStore((s) => s.resetAll)
  const dark = useStore((s) => s.dark)
  const toggleDark = useStore((s) => s.toggleDark)
  const { user, signOut, configured } = useAuth()

  const totalCheckins = habits.reduce((a, h) => a + computeStats(h.history, h.frequency).completedCount, 0)
  const since = habits.reduce<string | null>((min, h) => (!min || h.createdAt < min ? h.createdAt : min), null)
  const displayName = user?.email ? user.email.split('@')[0] : 'Guest'
  const statusLine = user?.email ?? (configured ? 'Not signed in' : 'Demo mode · backend not connected')

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
        <View style={[s.toggle, dark && { backgroundColor: C.primary, alignItems: 'flex-end' }]}>
          <View style={s.knob} />
        </View>
      </Pressable>

      <Text style={s.section}>Account</Text>
      <View style={s.menu}>
        {['Edit profile', 'Health profile', 'Notifications', 'Privacy & data'].map((m) => (
          <View key={m} style={s.menuRow}>
            <Text style={{ color: C.ink, fontSize: 15, fontFamily: FONT.medium }}>{m}</Text>
            <Text style={{ color: C.muted }}>›</Text>
          </View>
        ))}
        {user && (
          <Pressable style={s.menuRow} onPress={signOut}>
            <Text style={{ color: C.error, fontSize: 15, fontFamily: FONT.semibold }}>Sign out</Text>
            <Text style={{ color: C.muted }}>›</Text>
          </Pressable>
        )}
      </View>
      <Text style={{ color: C.muted, fontSize: 12, marginTop: 10, fontFamily: FONT.medium }}>
        {configured
          ? 'Your habits sync securely to your account.'
          : 'Add Supabase keys to .env to enable accounts and secure cloud sync.'}
      </Text>

      <View style={{ height: 20 }} />
      <PrimaryButton label="Reset demo data" onPress={resetAll} variant="ghost" />
    </ScrollView>
  )
}

const makeStyles = (C: Palette) => StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: 24, padding: 24, alignItems: 'center', ...cardShadow },
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
  toggle: { width: 46, height: 26, borderRadius: 13, backgroundColor: C.muted + '55', padding: 3, justifyContent: 'center' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
})
