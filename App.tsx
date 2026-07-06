import { useState, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, StatusBar, ActivityIndicator, Modal } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import * as Sentry from '@sentry/react-native'
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_800ExtraBold } from '@expo-google-fonts/playfair-display'
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans'
import { DMMono_500Medium } from '@expo-google-fonts/dm-mono'
import { FONT, type Palette } from './src/theme'
import { useColors } from './src/useColors'
import { AuthProvider, useAuth } from './src/auth'
import { useCloudSync, useProfileSync } from './src/sync'
import { useStore } from './src/store'
import { syncReminders } from './src/reminders'
import { Lotus } from './src/Lotus'
import { ErrorBoundary } from './src/ErrorBoundary'
import { NavProvider } from './src/nav'
import HabitDetail from './src/screens/HabitDetail'
import Paywall from './src/screens/Paywall'
import Auth from './src/screens/Auth'
import SetNewPassword from './src/screens/SetNewPassword'
import Onboarding from './src/screens/Onboarding'
import Home from './src/screens/Home'
import Habits from './src/screens/Habits'
import Health from './src/screens/Health'
import Progress from './src/screens/Progress'
import Profile from './src/screens/Profile'

// Crash + error monitoring. No-ops until you add EXPO_PUBLIC_SENTRY_DSN to .env,
// and stays quiet during local development so you only capture real-world errors.
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: !__DEV__,
    tracesSampleRate: 0.2,
  })
}

const TABS = [
  { key: 'home', label: 'Home', icon: '⌂', screen: <Home /> },
  { key: 'habits', label: 'Habits', icon: '☰', screen: <Habits /> },
  { key: 'health', label: 'Health', icon: '♥', screen: <Health /> },
  { key: 'progress', label: 'Progress', icon: '📊', screen: <Progress /> },
  { key: 'profile', label: 'Profile', icon: '☻', screen: <Profile /> },
]

function Splash() {
  const C = useColors()
  return (
    <View style={[makeStyles(C).shell, { alignItems: 'center', justifyContent: 'center' }]}>
      <Lotus size={110} color={C.secondary} />
      <ActivityIndicator color={C.primary} style={{ marginTop: 8 }} />
    </View>
  )
}

function Bar() {
  const dark = useStore((s) => s.dark)
  return <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
}

function MainShell() {
  const C = useColors()
  const s = makeStyles(C)
  const [tab, setTab] = useState('home')
  const active = TABS.find((t) => t.key === tab)!
  const habits = useStore((s) => s.habits)
  const notificationsEnabled = useStore((s) => s.notificationsEnabled)
  const paywallOpen = useStore((s) => s.paywallOpen)
  const closePaywall = useStore((s) => s.closePaywall)
  // Reschedule daily reminders when habits change; clear them when disabled.
  useEffect(() => {
    syncReminders(notificationsEnabled ? habits : [])
  }, [habits, notificationsEnabled])
  return (
    <NavProvider>
      {(nav) => (
        <SafeAreaView style={s.shell}>
          <Bar />
          <View style={{ flex: 1 }}>{active.screen}</View>
          <View style={s.nav}>
            {TABS.map((t) => {
              const on = tab === t.key
              return (
                <Pressable key={t.key} style={s.navItem} onPress={() => setTab(t.key)}
                  accessibilityRole="tab" accessibilityLabel={t.label} accessibilityState={{ selected: on }}>
                  <Text style={{ fontSize: 18, color: on ? C.primary : C.muted }}>{t.icon}</Text>
                  <Text style={{ fontSize: 10, fontFamily: FONT.semibold, color: on ? C.primary : C.muted }}>{t.label}</Text>
                </Pressable>
              )
            })}
          </View>
          <Modal visible={!!nav.detailId} animationType="slide" onRequestClose={nav.closeDetail}>
            {nav.detailId ? <HabitDetail id={nav.detailId} onClose={nav.closeDetail} /> : null}
          </Modal>
          <Modal visible={paywallOpen} animationType="slide" onRequestClose={closePaywall}>
            <Paywall />
          </Modal>
        </SafeAreaView>
      )}
    </NavProvider>
  )
}

function Root() {
  const C = useColors()
  const s = makeStyles(C)
  const { loading, configured, session, user, recovering } = useAuth()
  const [demo, setDemo] = useState(false)
  const onboarded = useStore((st) => st.onboarded)
  useCloudSync(user?.id)
  useProfileSync(user?.id)

  if (loading) return <Splash />
  if (recovering) {
    return (
      <SafeAreaView style={s.shell}>
        <Bar />
        <SetNewPassword />
      </SafeAreaView>
    )
  }
  const needAuth = configured ? !session : !demo
  if (needAuth) {
    return (
      <SafeAreaView style={s.shell}>
        <Bar />
        <Auth onDemo={() => setDemo(true)} />
      </SafeAreaView>
    )
  }
  if (!onboarded) {
    return (
      <SafeAreaView style={s.shell}>
        <Bar />
        <Onboarding />
      </SafeAreaView>
    )
  }
  return <MainShell />
}

function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold, PlayfairDisplay_800ExtraBold,
    DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold,
    DMMono_500Medium,
  })
  if (!fontsLoaded) return <Splash />
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  )
}

// Sentry.wrap enables native crash reporting + performance tracing on the root.
// It's a harmless passthrough when Sentry isn't initialized (no DSN set).
export default Sentry.wrap(App)

const makeStyles = (C: Palette) => StyleSheet.create({
  shell: { flex: 1, backgroundColor: C.canvas, maxWidth: 480, width: '100%', alignSelf: 'center' },
  nav: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.muted + '22', backgroundColor: C.card, paddingVertical: 8, paddingHorizontal: 8 },
  navItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
})
