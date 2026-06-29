import { useState, useEffect } from 'react'
import { SafeAreaView, View, Text, Pressable, StyleSheet, StatusBar, ActivityIndicator } from 'react-native'
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_800ExtraBold } from '@expo-google-fonts/playfair-display'
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans'
import { DMMono_500Medium } from '@expo-google-fonts/dm-mono'
import { FONT, type Palette } from './src/theme'
import { useColors } from './src/useColors'
import { AuthProvider, useAuth } from './src/auth'
import { useCloudSync } from './src/sync'
import { useStore } from './src/store'
import { syncReminders } from './src/reminders'
import { Lotus } from './src/Lotus'
import Auth from './src/screens/Auth'
import Onboarding from './src/screens/Onboarding'
import Home from './src/screens/Home'
import Habits from './src/screens/Habits'
import Health from './src/screens/Health'
import Progress from './src/screens/Progress'
import Profile from './src/screens/Profile'

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
  // Reschedule daily reminders when habits change; clear them when disabled.
  useEffect(() => {
    syncReminders(notificationsEnabled ? habits : [])
  }, [habits, notificationsEnabled])
  return (
    <SafeAreaView style={s.shell}>
      <Bar />
      <View style={{ flex: 1 }}>{active.screen}</View>
      <View style={s.nav}>
        {TABS.map((t) => {
          const on = tab === t.key
          return (
            <Pressable key={t.key} style={s.navItem} onPress={() => setTab(t.key)}>
              <Text style={{ fontSize: 18, color: on ? C.primary : C.muted }}>{t.icon}</Text>
              <Text style={{ fontSize: 10, fontFamily: FONT.semibold, color: on ? C.primary : C.muted }}>{t.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </SafeAreaView>
  )
}

function Root() {
  const C = useColors()
  const s = makeStyles(C)
  const { loading, configured, session, user } = useAuth()
  const [demo, setDemo] = useState(false)
  const onboarded = useStore((st) => st.onboarded)
  useCloudSync(user?.id)

  if (loading) return <Splash />
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

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold, PlayfairDisplay_800ExtraBold,
    DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold,
    DMMono_500Medium,
  })
  if (!fontsLoaded) return <Splash />
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}

const makeStyles = (C: Palette) => StyleSheet.create({
  shell: { flex: 1, backgroundColor: C.canvas, maxWidth: 480, width: '100%', alignSelf: 'center' },
  nav: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.muted + '22', backgroundColor: C.card, paddingVertical: 8, paddingHorizontal: 8 },
  navItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
})
