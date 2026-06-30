import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { LIGHT, FONT } from './theme'

type Props = { children: React.ReactNode }
type State = { hasError: boolean }

// Catches render-time crashes and shows a friendly fallback instead of a blank
// screen. (Pairs well with a crash reporter like Sentry — see componentDidCatch.)
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Vitalis crashed:', error, info.componentStack)
    // TODO: forward to a crash reporter (e.g. Sentry.captureException(error)).
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <View style={s.wrap}>
        <Text style={{ fontSize: 46 }}>🌿</Text>
        <Text style={s.title}>Something went wrong</Text>
        <Text style={s.body}>The app hit an unexpected error. Tap below to try again.</Text>
        <Pressable style={s.btn} onPress={() => this.setState({ hasError: false })}>
          <Text style={s.btnText}>Try again</Text>
        </Pressable>
      </View>
    )
  }
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: LIGHT.canvas },
  title: { fontFamily: FONT.display, fontSize: 22, color: LIGHT.forest, marginTop: 16 },
  body: { fontFamily: FONT.sans, fontSize: 14, color: LIGHT.muted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  btn: { backgroundColor: LIGHT.primary, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 28, marginTop: 22 },
  btnText: { color: LIGHT.white, fontFamily: FONT.bold, fontSize: 15 },
})
