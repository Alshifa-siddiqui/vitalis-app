import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native'
import { cardShadow, FONT, type Palette } from '../theme'
import { useColors } from '../useColors'
import { Ring, HabitRow, EmptyState } from '../ui'
import { useStore } from '../store'
import { usePullRefresh } from '../sync'
import { computeStats, isDoneToday } from '../streaks'

export default function Home() {
  const C = useColors()
  const s = makeStyles(C)
  const { refreshing, onRefresh } = usePullRefresh()
  const habits = useStore((s) => s.habits)
  const toggle = useStore((s) => s.toggleToday)
  const name = useStore((s) => s.profileName) || 'Friend'

  const done = habits.filter((h) => isDoneToday(h.history)).length
  const total = habits.length
  const pct = total ? Math.round((done / total) * 100) : 0
  const best = habits.reduce((m, h) => Math.max(m, computeStats(h.history, h.frequency).currentStreak), 0)

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />}>
      <View style={[s.rowBetween, { marginBottom: 18 }]}>
        <View>
          <Text style={{ color: C.muted, fontSize: 14 }}>Good morning 🌿</Text>
          <Text style={s.h1}>{name}</Text>
        </View>
        <View style={s.avatar}><Text style={{ color: C.white, fontSize: 18, fontWeight: '700' }}>{name[0].toUpperCase()}</Text></View>
      </View>

      <View style={s.hero}>
        <Ring value={pct} />
        <View style={{ flex: 1, gap: 10 }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Today's Progress</Text>
            <Text style={{ color: C.mint, fontSize: 15, fontFamily: FONT.bold }}>{done} of {total} done</Text>
          </View>
          <View style={s.pill}><Text style={s.pillText}>🔥  Best streak: {best}</Text></View>
          <View style={s.pill}><Text style={s.pillText}>📋  Active habits: {total}</Text></View>
        </View>
      </View>

      <View style={s.tip}>
        <Text style={{ fontSize: 20 }}>🤖</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.tipLabel}>DAILY TIP</Text>
          <Text style={{ color: C.ink, fontSize: 14, marginTop: 2 }}>
            {pct >= 80 ? 'Amazing momentum today — keep the streak alive!'
              : pct >= 40 ? 'Good start. A couple more check-ins will boost your day.'
              : 'A small step counts. Tap a habit below to begin.'}
          </Text>
        </View>
      </View>

      <View style={[s.rowBetween, { marginBottom: 12, alignItems: 'flex-end' }]}>
        <Text style={s.h2}>Today</Text>
        <Text style={{ color: C.muted, fontSize: 14 }}>{done} of {total} done</Text>
      </View>
      <View style={{ gap: 10 }}>
        {habits.map((h) => <HabitRow key={h.id} habit={h} onToggle={toggle} />)}
        {total === 0 && <EmptyState emoji="🌱" title="No habits yet" subtitle="Head to the Habits tab to plant your first one." />}
      </View>
    </ScrollView>
  )
}

const makeStyles = (C: Palette) => StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h1: { fontFamily: FONT.display, fontSize: 25, color: C.forest },
  h2: { fontFamily: FONT.display, fontSize: 19, color: C.forest },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 18, backgroundColor: C.hero, borderRadius: 26, padding: 20, ...cardShadow, shadowOpacity: 0.2, shadowRadius: 16 },
  pill: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9 },
  pillText: { color: C.white, fontSize: 13, fontFamily: FONT.semibold },
  tip: { flexDirection: 'row', gap: 12, backgroundColor: C.lightmint, borderColor: 'rgba(82,183,136,0.3)', borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 18, marginBottom: 22 },
  tipLabel: { fontSize: 11, fontFamily: FONT.bold, letterSpacing: 0.5, color: C.mid },
})
