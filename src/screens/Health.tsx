import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { C, cardShadow } from '../theme'
import { Ring, Header } from '../ui'
import { useStore } from '../store'

function isoDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Health() {
  const habits = useStore((s) => s.habits)
  const last7 = Array.from({ length: 7 }, (_, i) => isoDaysAgo(i))
  const rates = habits.map((h) => h.history.filter((d) => last7.includes(d)).length / 7)
  const score = rates.length ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100) : 0

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
      <Header title="Health Hub" subtitle="This week" />

      <View style={s.scoreCard}>
        <Ring value={score} color={C.secondary} track={C.lightmint} textColor={C.forest} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Georgia', fontSize: 20, fontWeight: '700', color: C.forest }}>Wellness Score</Text>
          <Text style={{ color: C.muted, marginTop: 4 }}>
            Based on your 7-day habit completion across {habits.length} habits.
          </Text>
        </View>
      </View>

      <View style={s.aiCard}>
        <Text style={{ fontSize: 22 }}>🤖</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '800', color: C.mid, fontSize: 12, letterSpacing: 0.5 }}>AI INSIGHTS — COMING SOON</Text>
          <Text style={{ color: C.ink, marginTop: 4, fontSize: 14 }}>
            Soon you'll upload a health report and get private, AI-powered insights tailored to your habits — processed securely on our server, never on-device.
          </Text>
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

const s = StyleSheet.create({
  scoreCard: { flexDirection: 'row', alignItems: 'center', gap: 18, backgroundColor: C.white, borderRadius: 24, padding: 20, ...cardShadow },
  aiCard: { flexDirection: 'row', gap: 12, backgroundColor: C.lightmint, borderRadius: 18, padding: 16, marginTop: 16, borderWidth: 1, borderColor: 'rgba(82,183,136,0.3)' },
  note: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginTop: 16, ...cardShadow },
})
