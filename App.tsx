import { useState } from 'react'
import {
  SafeAreaView, ScrollView, View, Text, Pressable, StyleSheet, StatusBar,
} from 'react-native'
import Svg, { Circle } from 'react-native-svg'

/* --------------------------------- theme ---------------------------------- */
const C = {
  forest: '#1B4332', primary: '#2D6A4F', mid: '#40916C', secondary: '#52B788',
  mint: '#95D5B2', lightmint: '#D8F3DC', canvas: '#F8FFF8', gold: '#FFD166',
  warmgold: '#F4A261', success: '#06D6A0', ink: '#1B2D24', muted: '#6B8576',
  white: '#FFFFFF',
}

type Habit = { id: number; name: string; icon: string; meta: string; streak: number; done: boolean; cat: string }
const INITIAL: Habit[] = [
  { id: 1, name: 'Morning Run', icon: '🏃', meta: '30 min · 7:00 AM', streak: 12, done: true, cat: 'Fitness' },
  { id: 2, name: 'Drink Water', icon: '💧', meta: '8 glasses', streak: 5, done: true, cat: 'Health' },
  { id: 3, name: 'Meditation', icon: '🧘', meta: '10 min · Evening', streak: 3, done: false, cat: 'Mental' },
  { id: 4, name: 'Read 20 Pages', icon: '📖', meta: 'Mental', streak: 8, done: false, cat: 'Mental' },
  { id: 5, name: 'Sleep by 11pm', icon: '😴', meta: '7–8 hrs', streak: 4, done: false, cat: 'Health' },
]

const TABS = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'habits', label: 'Habits', icon: '☰' },
  { key: 'health', label: 'Health', icon: '♥' },
  { key: 'progress', label: 'Progress', icon: '📊' },
  { key: 'profile', label: 'Profile', icon: '☻' },
]

/* ------------------------------- components -------------------------------- */
function Ring({ value, size = 116, stroke = 11 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r} stroke={C.gold} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round"
        />
      </Svg>
      <Text style={{ color: C.white, fontSize: 30, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, letterSpacing: 2 }}>/ 100</Text>
    </View>
  )
}

function MiniStat({ icon, label, pct }: { icon: string; label: string; pct: number }) {
  return (
    <View style={s.miniStat}>
      <View style={s.rowBetween}>
        <Text style={{ color: C.white, fontSize: 13 }}>{icon} {label}</Text>
        <Text style={{ color: C.white, fontSize: 13, fontWeight: '600' }}>{pct}%</Text>
      </View>
      <View style={s.track}><View style={[s.fill, { width: `${pct}%` }]} /></View>
    </View>
  )
}

function HabitRow({ h, onToggle }: { h: Habit; onToggle: (id: number) => void }) {
  return (
    <Pressable onPress={() => onToggle(h.id)} style={s.habit}>
      <View style={s.habitIcon}><Text style={{ fontSize: 20 }}>{h.icon}</Text></View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[s.habitName, h.done && { color: C.muted, textDecorationLine: 'line-through' }]} numberOfLines={1}>
          {h.name}
        </Text>
        <Text style={s.habitMeta} numberOfLines={1}>{h.meta}</Text>
      </View>
      {h.streak > 0 && <Text style={s.streak}>🔥 {h.streak}</Text>}
      <View style={[s.check, h.done ? { backgroundColor: C.success, borderColor: C.success } : { borderColor: C.mint }]}>
        {h.done && <Text style={{ color: C.white, fontSize: 14, fontWeight: '900' }}>✓</Text>}
      </View>
    </Pressable>
  )
}

/* --------------------------------- screens -------------------------------- */
function Home({ habits, toggle }: { habits: Habit[]; toggle: (id: number) => void }) {
  const done = habits.filter((h) => h.done).length
  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <View style={[s.rowBetween, { marginBottom: 18 }]}>
        <View>
          <Text style={{ color: C.muted, fontSize: 14 }}>Good morning 🌿</Text>
          <Text style={s.h1}>Sarah Johnson</Text>
        </View>
        <View style={s.avatar}><Text style={{ color: C.white, fontSize: 18, fontWeight: '700' }}>S</Text></View>
      </View>

      <View style={s.hero}>
        <Ring value={87} />
        <View style={{ flex: 1, gap: 10 }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Health Score</Text>
            <Text style={{ color: C.mint, fontSize: 13, fontWeight: '700' }}>↑ 3 pts today</Text>
          </View>
          <MiniStat icon="💧" label="Hydration" pct={90} />
          <MiniStat icon="😴" label="Sleep" pct={72} />
        </View>
      </View>

      <View style={s.tip}>
        <Text style={{ fontSize: 20 }}>🤖</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.tipLabel}>DAILY TIP</Text>
          <Text style={{ color: C.ink, fontSize: 14, marginTop: 2 }}>
            Your sleep improved! Try a 10-minute walk tonight to keep the momentum going.
          </Text>
        </View>
      </View>

      <View style={[s.rowBetween, { marginBottom: 12, alignItems: 'flex-end' }]}>
        <Text style={s.h2}>Today</Text>
        <Text style={{ color: C.muted, fontSize: 14 }}>{done} of {habits.length} done</Text>
      </View>
      <View style={{ gap: 10 }}>
        {habits.map((h) => <HabitRow key={h.id} h={h} onToggle={toggle} />)}
      </View>
    </ScrollView>
  )
}

function Placeholder({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <View style={s.center}>
      <View style={s.bigIcon}><Text style={{ fontSize: 40 }}>{emoji}</Text></View>
      <Text style={[s.h1, { marginTop: 18 }]}>{title}</Text>
      <Text style={{ color: C.muted, fontSize: 14, textAlign: 'center', marginTop: 8, maxWidth: 280 }}>{text}</Text>
    </View>
  )
}

/* ----------------------------------- app ---------------------------------- */
export default function App() {
  const [tab, setTab] = useState('home')
  const [habits, setHabits] = useState<Habit[]>(INITIAL)
  const toggle = (id: number) =>
    setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, done: !h.done } : h)))

  return (
    <SafeAreaView style={s.shell}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        {(tab === 'home' || tab === 'habits') && <Home habits={habits} toggle={toggle} />}
        {tab === 'health' && <Placeholder emoji="🏥" title="Health Hub" text="Upload reports and get AI-powered insights tailored to you. Coming next." />}
        {tab === 'progress' && <Placeholder emoji="📈" title="Your Progress" text="Streak calendars, trends, and weekly summaries land here." />}
        {tab === 'profile' && <Placeholder emoji="👤" title="Profile" text="Manage your goals, health profile, and preferences." />}
      </View>
      <View style={s.nav}>
        {TABS.map((t) => {
          const on = tab === t.key
          return (
            <Pressable key={t.key} style={s.navItem} onPress={() => setTab(t.key)}>
              <Text style={{ fontSize: 18, color: on ? C.primary : C.muted }}>{t.icon}</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: on ? C.primary : C.muted }}>{t.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </SafeAreaView>
  )
}

/* --------------------------------- styles --------------------------------- */
const card = { shadowColor: '#1B4332', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 }
const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: C.canvas, maxWidth: 480, width: '100%', alignSelf: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  h1: { fontFamily: 'Georgia', fontSize: 24, fontWeight: '700', color: C.forest },
  h2: { fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', color: C.forest },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 18, backgroundColor: C.forest, borderRadius: 26, padding: 20, ...card, shadowOpacity: 0.2, shadowRadius: 16 },
  miniStat: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 6, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: C.mint },
  tip: { flexDirection: 'row', gap: 12, backgroundColor: C.lightmint, borderColor: 'rgba(82,183,136,0.3)', borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 18, marginBottom: 22 },
  tipLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: C.mid },
  habit: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.white, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, ...card },
  habitIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.lightmint, alignItems: 'center', justifyContent: 'center' },
  habitName: { fontSize: 15, fontWeight: '700', color: C.ink },
  habitMeta: { fontSize: 12, color: C.muted, marginTop: 2 },
  streak: { backgroundColor: 'rgba(244,162,97,0.15)', color: C.warmgold, fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  bigIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: C.lightmint, alignItems: 'center', justifyContent: 'center' },
  nav: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', backgroundColor: C.white, paddingVertical: 8, paddingHorizontal: 8 },
  navItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
})
