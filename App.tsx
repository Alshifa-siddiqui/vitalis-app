import { useState, useEffect } from 'react'
import { SafeAreaView, View, Text, Pressable, StyleSheet, StatusBar, ActivityIndicator } from 'react-native'
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_800ExtraBold } from '@expo-google-fonts/playfair-display'
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans'
import { DMMono_500Medium } from '@expo-google-fonts/dm-mono'
import { C, FONT } from './src/theme'
import { AuthProvider, useAuth } from './src/auth'
import { useCloudSync } from './src/sync'
import { useStore } from './src/store'
import { syncReminders } from './src/reminders'
import Auth from './src/screens/Auth'
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
  return (
    <View style={[s.shell, { alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ fontSize: 30 }}>🌿</Text>
      <ActivityIndicator color={C.primary} style={{ marginTop: 12 }} />
    </View>
  )
}

function MainShell() {
  const [tab, setTab] = useState('home')
  const active = TABS.find((t) => t.key === tab)!
  const habits = useStore((s) => s.habits)
  // Reschedule daily reminders whenever habits (and their reminder times) change.
  useEffect(() => { syncReminders(habits) }, [habits])
  return (
    <SafeAreaView style={s.shell}>
      <StatusBar barStyle="dark-content" />
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
  const { loading, configured, session, user } = useAuth()
  const [demo, setDemo] = useState(false)
  useCloudSync(user?.id)

  if (loading) return <Splash />
  const needAuth = configured ? !session : !demo
  if (needAuth) {
    return (
      <SafeAreaView style={s.shell}>
        <StatusBar barStyle="dark-content" />
        <Auth onDemo={() => setDemo(true)} />
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

const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: C.canvas, maxWidth: 480, width: '100%', alignSelf: 'center' },
  nav: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', backgroundColor: C.white, paddingVertical: 8, paddingHorizontal: 8 },
  navItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
})
