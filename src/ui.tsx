import { View, Text, Pressable, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { cardShadow, FONT, type Palette } from './theme'
import { useColors } from './useColors'
import { useNav } from './nav'
import { computeStats, isDoneToday } from './streaks'
import type { Habit } from './store'

export function Ring({
  value, size = 116, stroke = 11, color = '#FFD166', track = 'rgba(255,255,255,0.2)', textColor = '#FFFFFF',
}: { value: number; size?: number; stroke?: number; color?: string; track?: string; textColor?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round"
        />
      </Svg>
      <Text style={{ color: textColor, fontSize: size * 0.26, fontFamily: FONT.mono }}>{value}</Text>
    </View>
  )
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const C = useColors()
  const s = makeStyles(C)
  return (
    <Pressable onPress={onPress}
      style={[s.chip, active ? { backgroundColor: C.primary } : { backgroundColor: C.card, borderWidth: 1, borderColor: C.muted + '33' }]}>
      <Text style={{ fontSize: 13, fontFamily: FONT.bold, color: active ? C.white : C.muted }}>{label}</Text>
    </Pressable>
  )
}

export function PrimaryButton({ label, onPress, variant = 'solid' }: { label: string; onPress: () => void; variant?: 'solid' | 'ghost' | 'danger' }) {
  const C = useColors()
  const s = makeStyles(C)
  const bg = variant === 'solid' ? C.primary : variant === 'danger' ? C.error : 'transparent'
  const fg = variant === 'ghost' ? C.primary : C.white
  return (
    <Pressable onPress={onPress}
      style={[s.btn, { backgroundColor: bg }, variant === 'ghost' && { borderWidth: 1.5, borderColor: C.primary }]}>
      <Text style={{ color: fg, fontFamily: FONT.bold, fontSize: 15 }}>{label}</Text>
    </Pressable>
  )
}

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const C = useColors()
  return (
    <View style={{ marginBottom: 16 }}>
      {subtitle ? <Text style={{ color: C.muted, fontSize: 14 }}>{subtitle}</Text> : null}
      <Text style={{ fontFamily: FONT.display, fontSize: 25, color: C.forest }}>{title}</Text>
    </View>
  )
}

export function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  const C = useColors()
  return (
    <View style={{ alignItems: 'center', paddingVertical: 44, paddingHorizontal: 24 }}>
      <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: C.lightmint, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 42 }}>{emoji}</Text>
      </View>
      <Text style={{ fontFamily: FONT.display, fontSize: 19, color: C.forest, marginTop: 16 }}>{title}</Text>
      <Text style={{ color: C.muted, fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>{subtitle}</Text>
    </View>
  )
}

export function HabitRow({ habit, onToggle, onLongPress }: { habit: Habit; onToggle: (id: string) => void; onLongPress?: (h: Habit) => void }) {
  const C = useColors()
  const s = makeStyles(C)
  const { openDetail } = useNav()
  const stats = computeStats(habit.history, habit.frequency)
  const done = isDoneToday(habit.history)
  return (
    <Pressable onPress={() => openDetail(habit.id)} onLongPress={() => onLongPress?.(habit)} style={s.habit}>
      <View style={s.habitIcon}><Text style={{ fontSize: 20 }}>{habit.icon}</Text></View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[s.habitName, done && { color: C.muted, textDecorationLine: 'line-through' }]} numberOfLines={1}>{habit.name}</Text>
        <Text style={s.habitMeta} numberOfLines={1}>{habit.category} · {habit.frequency}</Text>
      </View>
      {stats.currentStreak > 0 && <Text style={s.streak}>🔥 {stats.currentStreak}</Text>}
      <Pressable onPress={() => onToggle(habit.id)} hitSlop={8}
        style={[s.check, done ? { backgroundColor: C.success, borderColor: C.success } : { borderColor: C.mint }]}>
        {done && <Text style={{ color: C.white, fontSize: 14, fontWeight: '900' }}>✓</Text>}
      </Pressable>
    </Pressable>
  )
}

const makeStyles = (C: Palette) => StyleSheet.create({
  chip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999, marginRight: 8 },
  btn: { borderRadius: 14, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  habit: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12, ...cardShadow },
  habitIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.lightmint, alignItems: 'center', justifyContent: 'center' },
  habitName: { fontSize: 15, fontFamily: FONT.bold, color: C.ink },
  habitMeta: { fontSize: 12, fontFamily: FONT.medium, color: C.muted, marginTop: 2, textTransform: 'capitalize' },
  streak: { backgroundColor: 'rgba(244,162,97,0.15)', color: C.warmgold, fontSize: 12, fontFamily: FONT.bold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
})
