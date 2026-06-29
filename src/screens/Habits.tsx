import { useState } from 'react'
import { View, Text, ScrollView, Pressable, Modal, TextInput, StyleSheet, RefreshControl } from 'react-native'
import { cardShadow, ICON_CHOICES, CATEGORIES, FONT, type Palette } from '../theme'
import { useColors } from '../useColors'
import { Chip, PrimaryButton, HabitRow, Header, EmptyState } from '../ui'
import { useStore, type Habit } from '../store'
import { usePullRefresh } from '../sync'
import type { Frequency } from '../streaks'

const FREQS: Frequency[] = ['daily', 'weekly', 'monthly']
const REMIND = ['Off', '07:00', '08:00', '12:00', '18:00', '21:00']

export default function Habits() {
  const C = useColors()
  const s = makeStyles(C)
  const { refreshing, onRefresh } = usePullRefresh()
  const habits = useStore((s) => s.habits)
  const toggle = useStore((s) => s.toggleToday)
  const addHabit = useStore((s) => s.addHabit)
  const updateHabit = useStore((s) => s.updateHabit)
  const deleteHabit = useStore((s) => s.deleteHabit)

  const [filter, setFilter] = useState('All')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Habit | null>(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ICON_CHOICES[0])
  const [freq, setFreq] = useState<Frequency>('daily')
  const [cat, setCat] = useState(CATEGORIES[0])
  const [remind, setRemind] = useState('Off')

  const cats = ['All', ...CATEGORIES]
  const shown = filter === 'All' ? habits : habits.filter((h) => h.category === filter)

  const openAdd = () => {
    setEditing(null); setName(''); setIcon(ICON_CHOICES[0]); setFreq('daily'); setCat(CATEGORIES[0]); setRemind('Off'); setOpen(true)
  }
  const openEdit = (h: Habit) => {
    setEditing(h); setName(h.name); setIcon(h.icon); setFreq(h.frequency); setCat(h.category); setRemind(h.reminderTime || 'Off'); setOpen(true)
  }
  const save = () => {
    if (!name.trim()) return
    const reminderTime = remind === 'Off' ? undefined : remind
    if (editing) updateHabit(editing.id, { name: name.trim(), icon, frequency: freq, category: cat, reminderTime })
    else addHabit({ name: name.trim(), icon, frequency: freq, category: cat, reminderTime })
    setOpen(false)
  }
  const remove = () => { if (editing) { deleteHabit(editing.id); setOpen(false) } }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96 }} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />}>
        <Header title="My Habits" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {cats.map((c) => <Chip key={c} label={c} active={filter === c} onPress={() => setFilter(c)} />)}
        </ScrollView>
        <View style={{ gap: 10 }}>
          {shown.map((h) => <HabitRow key={h.id} habit={h} onToggle={toggle} onLongPress={openEdit} />)}
          {shown.length === 0 && <EmptyState emoji="🌿" title="No habits here" subtitle="Tap the + button to add your first habit." />}
        </View>
        {shown.length > 0 && <Text style={{ color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 16 }}>Tip: tap to check in · long-press to edit</Text>}
      </ScrollView>

      <Pressable style={s.fab} onPress={openAdd}>
        <Text style={{ color: C.white, fontSize: 30, marginTop: -2 }}>+</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.sheetTitle}>{editing ? 'Edit Habit' : 'New Habit'}</Text>

              <Text style={s.label}>Name</Text>
              <TextInput value={name} onChangeText={setName} placeholder="e.g. Morning Run"
                placeholderTextColor={C.muted} style={s.input} />

              <Text style={s.label}>Icon</Text>
              <View style={s.iconWrap}>
                {ICON_CHOICES.map((ic) => (
                  <Pressable key={ic} onPress={() => setIcon(ic)}
                    style={[s.iconBtn, icon === ic && { backgroundColor: C.lightmint, borderColor: C.secondary }]}>
                    <Text style={{ fontSize: 20 }}>{ic}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={s.label}>Frequency</Text>
              <View style={{ flexDirection: 'row' }}>
                {FREQS.map((f) => <Chip key={f} label={f} active={freq === f} onPress={() => setFreq(f)} />)}
              </View>

              <Text style={s.label}>Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map((cc) => <Chip key={cc} label={cc} active={cat === cc} onPress={() => setCat(cc)} />)}
              </View>

              <Text style={s.label}>Reminder</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {REMIND.map((r) => <Chip key={r} label={r} active={remind === r} onPress={() => setRemind(r)} />)}
              </View>

              <View style={{ height: 18 }} />
              <PrimaryButton label={editing ? 'Save Changes' : 'Add Habit'} onPress={save} />
              <View style={{ height: 10 }} />
              {editing
                ? <PrimaryButton label="Delete Habit" onPress={remove} variant="danger" />
                : <PrimaryButton label="Cancel" onPress={() => setOpen(false)} variant="ghost" />}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const makeStyles = (C: Palette) => StyleSheet.create({
  fab: { position: 'absolute', right: 20, bottom: 20, width: 58, height: 58, borderRadius: 29, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', ...cardShadow, shadowOpacity: 0.3, shadowRadius: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.canvas, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, maxHeight: '88%' },
  sheetTitle: { fontFamily: FONT.display, fontSize: 23, color: C.forest, marginBottom: 8 },
  label: { fontSize: 13, fontFamily: FONT.bold, color: C.muted, marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontFamily: FONT.sans, color: C.ink, borderWidth: 1, borderColor: C.muted + '33' },
  iconWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: { width: 46, height: 46, borderRadius: 14, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.muted + '33' },
})
