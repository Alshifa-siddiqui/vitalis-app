import { useState } from 'react'
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { cardShadow, FONT, type Palette } from '../theme'
import { useColors } from '../useColors'
import { Ring, Header, PrimaryButton } from '../ui'
import { useStore } from '../store'
import { getAIInsight } from '../ai'

function isoDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Health() {
  const C = useColors()
  const s = makeStyles(C)
  const habits = useStore((s) => s.habits)
  const last7 = Array.from({ length: 7 }, (_, i) => isoDaysAgo(i))
  const rates = habits.map((h) => h.history.filter((d) => last7.includes(d)).length / 7)
  const score = rates.length ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100) : 0

  const [insight, setInsight] = useState('')
  const [aiError, setAiError] = useState('')
  const [loading, setLoading] = useState(false)

  const runInsight = async () => {
    setLoading(true); setAiError(''); setInsight('')
    const res = await getAIInsight(habits)
    setLoading(false)
    if (res.error) setAiError(res.error)
    else setInsight(res.insight ?? '')
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <Header title="Health Hub" subtitle="This week" />

      <View style={s.scoreCard}>
        <Ring value={score} color={C.secondary} track={C.lightmint} textColor={C.forest} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.display, fontSize: 20, color: C.forest }}>Wellness Score</Text>
          <Text style={{ color: C.muted, marginTop: 4 }}>
            Based on your 7-day habit completion across {habits.length} habits.
          </Text>
        </View>
      </View>

      <View style={s.aiCard}>
        <Text style={{ fontSize: 22 }}>🤖</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.bold, color: C.mid, fontSize: 12, letterSpacing: 0.5 }}>AI WELLNESS COACH</Text>
          <Text style={{ color: C.ink, marginTop: 4, fontSize: 14 }}>
            Get a private, AI-powered insight tailored to your habits — generated securely on the server, never on-device.
          </Text>
          <View style={{ height: 12 }} />
          {loading
            ? <ActivityIndicator color={C.primary} />
            : <PrimaryButton label="✨ Get AI Insight" onPress={runInsight} />}
          {aiError ? <Text style={{ color: C.error, fontFamily: FONT.medium, fontSize: 13, marginTop: 10 }}>{aiError}</Text> : null}
          {insight ? <Text style={{ color: C.ink, fontSize: 14, marginTop: 12, lineHeight: 20 }}>{insight}</Text> : null}
        </View>
      </View>

      <View style={s.note}>
        <Text style={{ color: C.muted, fontSize: 13, lineHeight: 19 }}>
          ⚠️  Vitalis offers general wellness information only — not medical advice. Always consult a qualified healthcare professional.
        </Text>
      </View>
    </ScrollView>
  )
}

const makeStyles = (C: Palette) => StyleSheet.create({
  scoreCard: { flexDirection: 'row', alignItems: 'center', gap: 18, backgroundColor: C.card, borderRadius: 24, padding: 20, ...cardShadow },
  aiCard: { flexDirection: 'row', gap: 12, backgroundColor: C.lightmint, borderRadius: 18, padding: 16, marginTop: 16, borderWidth: 1, borderColor: 'rgba(82,183,136,0.3)' },
  note: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginTop: 16, ...cardShadow },
})
