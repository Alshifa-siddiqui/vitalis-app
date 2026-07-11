import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { cardShadow, FONT, type Palette } from '../theme'
import { useColors } from '../useColors'
import { Heatmap } from '../Heatmap'
import { PrimaryButton } from '../ui'
import { useStore } from '../store'
import { tapFeedback, successFeedback } from '../haptics'
import { computeStats, isDoneToday, habitStrength } from '../streaks'

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function Stat({ value, label, C }: { value: string | number; label: string; C: Palette }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 14, alignItems: 'center', ...cardShadow }}>
      <Text style={{ fontFamily: FONT.mono, fontSize: 22, color: C.primary }}>{value}</Text>
      <Text style={{ fontSize: 11, fontFamily: FONT.medium, color: C.muted, marginTop: 2, textAlign: 'center' }}>{label}</Text>
    </View>
  )
}

export default function HabitDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const C = useColors()
  const s = makeStyles(C)
  const habit = useStore((st) => st.habits.find((h) => h.id === id))
  const toggleToday = useStore((st) => st.toggleToday)
  const toggleArchive = useStore((st) => st.toggleArchive)
  const deleteHabit = useStore((st) => st.deleteHabit)

  if (!habit) return <View style={s.wrap} />

  const stats = computeStats(habit.history, habit.frequency, habit.days)
  const strength = habitStrength(habit.history, habit.frequency, habit.days)
  const done = isDoneToday(habit.history)
  const checkIn = () => {
    if (done) tapFeedback()
    else successFeedback()
    toggleToday(habit.id)
  }
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  const weekDone = habit.history.filter((d) => last7.includes(d)).length

  return (
    <View style={s.wrap}>
      <View style={s.topbar}>
        <Pressable onPress={onClose} hitSlop={12}><Text style={{ fontSize: 26, color: C.muted }}>✕</Text></Pressable>
        {habit.archived ? <Text style={s.archivedTag}>Archived</Text> : <View />}
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginBottom: 18 }}>
          <View style={s.icon}><Text style={{ fontSize: 40 }}>{habit.icon}</Text></View>
          <Text style={s.name}>{habit.name}</Text>
          <Text style={s.meta}>
            {habit.category} · {habit.days && habit.days.length ? habit.days.map((d) => DAY_ABBR[d]).join(', ') : habit.frequency}
            {habit.reminderTime ? ` · ⏰ ${habit.reminderTime}` : ''}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat value={`🔥 ${stats.currentStreak}`} label="Current streak" C={C} />
          <Stat value={stats.longestStreak} label="Best streak" C={C} />
          <Stat value={stats.completedCount} label="Total check-ins" C={C} />
        </View>

        <View style={s.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={s.cardLabel}>Habit strength</Text>
            <Text style={{ fontFamily: FONT.mono, fontSize: 13, color: C.primary }}>{strength}%</Text>
          </View>
          <View style={s.strengthTrack}><View style={[s.strengthFill, { width: `${strength}%` }]} /></View>
          <Text style={{ color: C.muted, fontSize: 11, marginTop: 8 }}>Recovers as you check in — one missed day won’t reset it.</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardLabel}>Last 13 weeks  ·  {weekDone}/7 this week</Text>
          <Heatmap history={habit.history} />
        </View>

        <View style={{ height: 18 }} />
        <PrimaryButton label={done ? 'Undo today’s check-in' : 'Check in today'} onPress={checkIn} variant={done ? 'ghost' : 'solid'} />
        <View style={{ height: 10 }} />
        <PrimaryButton label={habit.archived ? 'Unarchive' : 'Archive'} onPress={() => { toggleArchive(habit.id); onClose() }} variant="ghost" />
        <View style={{ height: 10 }} />
        <PrimaryButton label="Delete habit" onPress={() => { deleteHabit(habit.id); onClose() }} variant="danger" />
      </ScrollView>
    </View>
  )
}

const makeStyles = (C: Palette) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.canvas },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
  archivedTag: { color: C.warmgold, fontFamily: FONT.bold, fontSize: 12, backgroundColor: C.warmgold + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  icon: { width: 84, height: 84, borderRadius: 28, backgroundColor: C.lightmint, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: FONT.display, fontSize: 25, color: C.forest, marginTop: 14, textAlign: 'center' },
  meta: { fontFamily: FONT.medium, fontSize: 14, color: C.muted, marginTop: 4, textTransform: 'capitalize' },
  card: { backgroundColor: C.card, borderRadius: 18, padding: 16, marginTop: 18, ...cardShadow },
  cardLabel: { fontFamily: FONT.bold, fontSize: 12, color: C.muted, marginBottom: 12 },
  strengthTrack: { height: 10, borderRadius: 5, backgroundColor: C.lightmint, overflow: 'hidden' },
  strengthFill: { height: 10, borderRadius: 5, backgroundColor: C.secondary },
})
