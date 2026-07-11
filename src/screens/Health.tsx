import { useState } from 'react'
import { ScrollView, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { cardShadow, FONT, type Palette } from '../theme'
import { useColors } from '../useColors'
import { Ring, Header, PrimaryButton } from '../ui'
import { useStore } from '../store'
import { getAIInsight } from '../ai'
import { aiInsightsLeft, FREE_AI_PER_MONTH } from '../premium'

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

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

  const insights = useStore((s) => s.insights)
  const addInsight = useStore((s) => s.addInsight)
  const clearInsights = useStore((s) => s.clearInsights)
  const plus = useStore((s) => s.plus)
  const aiUsage = useStore((s) => s.aiUsage)
  const recordAiUse = useStore((s) => s.recordAiUse)
  const openPaywall = useStore((s) => s.openPaywall)

  const [aiError, setAiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fast, setFast] = useState(false)

  const left = aiInsightsLeft(plus, aiUsage)

  const runInsight = async () => {
    if (left <= 0) { openPaywall(); return }
    setLoading(true); setAiError('')
    const res = await getAIInsight(habits, { fast })
    setLoading(false)
    if (res.error) setAiError(res.error)
    else if (res.insight) { addInsight(res.insight); if (!res.cached) recordAiUse() }
  }

  const latest = insights[0]
  const past = insights.slice(1)

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
          <Pressable onPress={() => setFast((v) => !v)} accessibilityRole="switch" accessibilityState={{ checked: fast }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <View style={[s.checkbox, fast && { backgroundColor: C.primary, borderColor: C.primary }]}>
              {fast ? <Text style={{ color: C.white, fontSize: 12, fontWeight: '900' }}>✓</Text> : null}
            </View>
            <Text style={{ color: C.mid, fontSize: 13, fontFamily: FONT.medium }}>⚡ Faster, lighter model</Text>
          </Pressable>
          <Text style={{ color: C.muted, fontSize: 12, fontFamily: FONT.medium, marginTop: 10 }}>
            {plus ? '⭐ Plus · unlimited insights' : `${left} of ${FREE_AI_PER_MONTH} free insights left this month`}
          </Text>
          <View style={{ height: 12 }} />
          {loading
            ? <ActivityIndicator color={C.primary} />
            : <PrimaryButton label={left <= 0 ? '⭐ Upgrade for unlimited insights' : latest ? '✨ Get a new insight' : '✨ Get AI Insight'} onPress={runInsight} />}
          {aiError ? <Text style={{ color: C.error, fontFamily: FONT.medium, fontSize: 13, marginTop: 10 }}>{aiError}</Text> : null}
          {latest ? (
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: C.ink, fontSize: 14, lineHeight: 20 }}>{latest.text}</Text>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 6, fontFamily: FONT.medium }}>{timeAgo(latest.at)}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {past.length > 0 && (
        <View style={s.historyCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: FONT.bold, color: C.mid, fontSize: 12, letterSpacing: 0.5 }}>PAST INSIGHTS</Text>
            <Pressable onPress={clearInsights} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear insight history">
              <Text style={{ color: C.muted, fontSize: 12, fontFamily: FONT.medium }}>Clear</Text>
            </Pressable>
          </View>
          {past.map((it, i) => (
            <View key={it.at} style={[{ paddingVertical: 12 }, i < past.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.muted + '22' }]}>
              <Text style={{ color: C.ink, fontSize: 13, lineHeight: 19 }}>{it.text}</Text>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 6, fontFamily: FONT.medium }}>{timeAgo(it.at)}</Text>
            </View>
          ))}
        </View>
      )}

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
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: C.mid, alignItems: 'center', justifyContent: 'center' },
  historyCard: { backgroundColor: C.card, borderRadius: 18, padding: 16, marginTop: 16, ...cardShadow },
  note: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginTop: 16, ...cardShadow },
})
