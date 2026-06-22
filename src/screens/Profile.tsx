import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { C, cardShadow } from '../theme'
import { Header, PrimaryButton } from '../ui'
import { useStore } from '../store'
import { computeStats } from '../streaks'

export default function Profile() {
  const habits = useStore((s) => s.habits)
  const resetAll = useStore((s) => s.resetAll)

  const totalCheckins = habits.reduce((a, h) => a + computeStats(h.history, h.frequency).completedCount, 0)
  const since = habits.reduce<string | null>((min, h) => (!min || h.createdAt < min ? h.createdAt : min), null)

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <Header title="Profile" />

      <View style={s.card}>
        <View style={s.avatar}><Text style={{ color: C.white, fontSize: 28, fontWeight: '700' }}>S</Text></View>
        <Text style={s.name}>Sarah Johnson</Text>
        <Text style={{ color: C.muted, marginTop: 2 }}>Member since {since ?? '—'}</Text>
        <View style={s.statsRow}>
          <View style={s.stat}><Text style={s.statV}>{habits.length}</Text><Text style={s.statL}>Habits</Text></View>
          <View style={s.divider} />
          <View style={s.stat}><Text style={s.statV}>{totalCheckins}</Text><Text style={s.statL}>Check-ins</Text></View>
        </View>
      </View>

      <Text style={s.section}>Account</Text>
      <View style={s.menu}>
        {['Edit profile', 'Health profile', 'Notifications', 'Privacy & data', 'Sign out'].map((m) => (
          <View key={m} style={s.menuRow}>
            <Text style={{ color: C.ink, fontSize: 15 }}>{m}</Text>
            <Text style={{ color: C.muted }}>›</Text>
          </View>
        ))}
      </View>
      <Text style={{ color: C.muted, fontSize: 12, marginTop: 10 }}>
        Auth, secure cloud sync and these settings arrive in the next phase.
      </Text>

      <View style={{ height: 20 }} />
      <PrimaryButton label="Reset demo data" onPress={resetAll} variant="ghost" />
    </ScrollView>
  )
}

const s = StyleSheet.create({
  card: { backgroundColor: C.white, borderRadius: 24, padding: 24, alignItems: 'center', ...cardShadow },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: C.forest, marginTop: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  stat: { alignItems: 'center', paddingHorizontal: 24 },
  statV: { fontFamily: 'Georgia', fontSize: 24, fontWeight: '700', color: C.primary },
  statL: { fontSize: 12, color: C.muted, marginTop: 2 },
  divider: { width: 1, height: 36, backgroundColor: 'rgba(0,0,0,0.08)' },
  section: { fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', color: C.forest, marginTop: 24, marginBottom: 12 },
  menu: { backgroundColor: C.white, borderRadius: 18, overflow: 'hidden', ...cardShadow },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
})
