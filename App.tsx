import { useState } from 'react'
import { SafeAreaView, View, Text, Pressable, StyleSheet, StatusBar } from 'react-native'
import { C } from './src/theme'
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

export default function App() {
  const [tab, setTab] = useState('home')
  const active = TABS.find((t) => t.key === tab)!

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
              <Text style={{ fontSize: 10, fontWeight: '600', color: on ? C.primary : C.muted }}>{t.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: C.canvas, maxWidth: 480, width: '100%', alignSelf: 'center' },
  nav: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', backgroundColor: C.white, paddingVertical: 8, paddingHorizontal: 8 },
  navItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
})
