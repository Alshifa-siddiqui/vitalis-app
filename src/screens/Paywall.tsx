import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { cardShadow, FONT, type Palette } from '../theme'
import { useColors } from '../useColors'
import { PrimaryButton } from '../ui'
import { useStore } from '../store'
import { PLUS_BENEFITS, PLUS_PRICE } from '../premium'
import { log } from '../log'

export default function Paywall() {
  const C = useColors()
  const s = makeStyles(C)
  const setPlus = useStore((st) => st.setPlus)
  const close = useStore((st) => st.closePaywall)

  // Simulated purchase for now. Real billing (RevenueCat) will set `plus` from
  // the store entitlement instead — this screen won't need to change.
  const upgrade = () => {
    log.event('plus_upgrade_tapped', { simulated: true })
    setPlus(true)
    close()
  }

  return (
    <View style={s.wrap}>
      <View style={s.topbar}>
        <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={{ fontSize: 26, color: C.muted }}>✕</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 4 }} showsVerticalScrollIndicator={false}>
        <View style={s.badge}><Text style={{ fontSize: 34 }}>🌿</Text></View>
        <Text style={s.title}>Vitalis Plus</Text>
        <Text style={s.sub}>Unlock the full experience and support the app.</Text>

        <View style={s.card}>
          {PLUS_BENEFITS.map((b) => (
            <View key={b} style={s.row}>
              <Text style={{ color: C.secondary, fontSize: 16 }}>✓</Text>
              <Text style={s.benefit}>{b}</Text>
            </View>
          ))}
        </View>

        <Text style={s.price}>{PLUS_PRICE}</Text>
        <PrimaryButton label="Upgrade to Plus" onPress={upgrade} />
        <View style={{ height: 10 }} />
        <PrimaryButton label="Restore purchase" onPress={close} variant="ghost" />

        <Text style={s.fine}>
          Billing isn’t live yet — this is a preview of Plus. Real subscriptions
          (with restore) arrive with the store release. Cancel anytime.
        </Text>
      </ScrollView>
    </View>
  )
}

const makeStyles = (C: Palette) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.canvas },
  topbar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 16 },
  badge: { width: 72, height: 72, borderRadius: 24, backgroundColor: C.lightmint, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: FONT.display, fontSize: 28, color: C.forest, textAlign: 'center', marginTop: 14 },
  sub: { fontFamily: FONT.medium, fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 6, marginBottom: 22 },
  card: { backgroundColor: C.card, borderRadius: 20, padding: 20, gap: 14, ...cardShadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefit: { flex: 1, color: C.ink, fontSize: 15, fontFamily: FONT.medium },
  price: { fontFamily: FONT.bold, fontSize: 16, color: C.forest, textAlign: 'center', marginVertical: 20 },
  fine: { color: C.muted, fontSize: 12, fontFamily: FONT.medium, textAlign: 'center', marginTop: 16, lineHeight: 18 },
})
