import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { FONT, type Palette } from '../theme'
import { useColors } from '../useColors'
import { Lotus } from '../Lotus'
import { PrimaryButton } from '../ui'
import { useStore } from '../store'

const SLIDES = [
  { lotus: true, emoji: '', title: 'Welcome to Vitalis', body: 'Build lasting habits and grow a little, every single day.' },
  { lotus: false, emoji: '🔥', title: 'Build your streaks', body: 'Check in daily, watch your streaks grow, and earn badges along the way.' },
  { lotus: false, emoji: '🤖', title: 'AI wellness coach', body: 'Get private, AI-powered insights tailored to your habits — secure by design.' },
]

const GOALS = [
  { key: 'Fitness', emoji: '🏃' }, { key: 'Sleep', emoji: '😴' }, { key: 'Nutrition', emoji: '🥗' },
  { key: 'Mindfulness', emoji: '🧘' }, { key: 'Learning', emoji: '📖' }, { key: 'Hydration', emoji: '💧' },
]

export default function Onboarding() {
  const C = useColors()
  const s = makeStyles(C)
  const complete = useStore((st) => st.completeOnboarding)
  const [step, setStep] = useState(0) // 0..2 slides, 3 = goals
  const [selected, setSelected] = useState<string[]>([])

  const toggleGoal = (k: string) =>
    setSelected((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))

  if (step < SLIDES.length) {
    const slide = SLIDES[step]
    return (
      <View style={s.wrap}>
        <Pressable style={s.skip} onPress={() => setStep(SLIDES.length)}>
          <Text style={{ color: C.muted, fontFamily: FONT.semibold }}>Skip</Text>
        </Pressable>
        <View style={s.center}>
          {slide.lotus
            ? <Lotus size={150} color={C.secondary} />
            : <View style={s.iconCircle}><Text style={{ fontSize: 60 }}>{slide.emoji}</Text></View>}
          <Text style={s.title}>{slide.title}</Text>
          <Text style={s.body}>{slide.body}</Text>
        </View>
        <View style={s.footer}>
          <View style={s.dots}>
            {SLIDES.map((_, i) => <View key={i} style={[s.dot, i === step && s.dotActive]} />)}
          </View>
          <PrimaryButton label={step === SLIDES.length - 1 ? 'Choose your goals' : 'Next'} onPress={() => setStep(step + 1)} />
        </View>
      </View>
    )
  }

  // GOAL SELECTION
  return (
    <View style={s.wrap}>
      <ScrollView contentContainerStyle={{ paddingTop: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>What do you want to focus on?</Text>
        <Text style={[s.body, { marginBottom: 24 }]}>Pick a few areas — we'll tailor your experience.</Text>
        <View style={s.grid}>
          {GOALS.map((g) => {
            const on = selected.includes(g.key)
            return (
              <Pressable key={g.key} onPress={() => toggleGoal(g.key)}
                style={[s.goal, on && { backgroundColor: C.lightmint, borderColor: C.secondary }]}>
                <Text style={{ fontSize: 34 }}>{g.emoji}</Text>
                <Text style={[s.goalLabel, on && { color: C.forest }]}>{g.key}</Text>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>
      <View style={{ paddingBottom: 8 }}>
        <PrimaryButton label="Get Started" onPress={() => complete(selected)} />
      </View>
    </View>
  )
}

const makeStyles = (C: Palette) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.canvas, padding: 28, paddingTop: 56 },
  skip: { position: 'absolute', top: 52, right: 24, padding: 8, zIndex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 150, height: 150, borderRadius: 40, backgroundColor: C.lightmint, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: FONT.displayXL, fontSize: 28, color: C.forest, textAlign: 'center', marginTop: 28 },
  body: { fontFamily: FONT.sans, fontSize: 15, color: C.muted, textAlign: 'center', marginTop: 10, lineHeight: 22, paddingHorizontal: 8 },
  footer: { gap: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.muted + '55' },
  dotActive: { width: 22, backgroundColor: C.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 },
  goal: { width: '47%', aspectRatio: 1.3, borderRadius: 20, backgroundColor: C.card, borderWidth: 2, borderColor: C.muted + '22', alignItems: 'center', justifyContent: 'center', gap: 8 },
  goalLabel: { fontFamily: FONT.bold, fontSize: 15, color: C.ink },
})
