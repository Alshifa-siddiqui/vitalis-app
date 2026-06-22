import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { C, cardShadow } from '../theme'
import { Header } from '../ui'
import { useStore } from '../store'
import { computeStats, BADGES } from '../streaks'

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  )
}

export default function Progress() {
  const habits = useStore((s) => s.habits)
  const stats = habits.map((h) => ({ h, st: computeStats(h.history, h.frequency) }))
  const totalCheckins = stats.reduce((a, x) => a + x.st.completedCount, 0)
  const bestStreak = stats.reduce((a, x) => Math.max(a, x.st.longestStreak), 0)
  const earned = BADGES.filter((b) => stats.some((x) => b.test(x.st)))

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <Header title="Your Progress" />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Stat value={totalCheckins} label="Check-ins" />
        <Stat value={bestStreak} label="Best streak" />
        <Stat value={habits.length} label="Habits" />
      </View>

      <Text style={s.section}>Badges</Text>
      <View style={s.badgeWrap}>
        {BADGES.map((b) => {
          const on = earned.includes(b)
          return (
            <View key={b.name} style={[s.badge, !on && { opacity: 0.35 }]}>
              <Text style={{ fontSize: 26 }}>{b.icon}</Text>
              <Text style={s.badgeName}>{b.name}</Text>
            </View>
          )
        })}
      </View>

      <Text style={s.section}>Per habit</Text>
      <View style={{ gap: 10 }}>
        {stats.map(({ h, st }) => (
          <View key={h.id} style={s.row}>
            <Text style={{ fontSize: 20 }}>{h.icon}</Text>
            <Text style={{ flex: 1, fontWeight: '700', color: C.ink }} numberOfLines={1}>{h.name}</Text>
            <Text style={{ color: C.warmgold, fontWeight: '700' }}>🔥 {st.currentStreak}</Text>
            <Text style={{ color: C.muted, fontSize: 12 }}>best {st.longestStreak}</Text>
          </View>
        ))}
        {habits.length === 0 && <Text style={{ color: C.muted, textAlign: 'center' }}>Add habits to see progress.</Text>}
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  stat: { flex: 1, backgroundColor: C.white, borderRadius: 18, padding: 16, alignItems: 'center', ...cardShadow },
  statValue: { fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: C.primary },
  statLabel: { fontSize: 12, color: C.muted, marginTop: 2 },
  section: { fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', color: C.forest, marginTop: 24, marginBottom: 12 },
  badgeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { width: 90, backgroundColor: C.white, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 4, ...cardShadow },
  badgeName: { fontSize: 11, fontWeight: '600', color: C.muted, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, ...cardShadow },
})
