import { useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'

// A calm "breathing" lotus with a pulsing halo. Pure Animated (no extra deps),
// works on native and web.
export function Lotus({ size = 120, color = '#52B788' }: { size?: number; color?: string }) {
  const breathe = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const b = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    const p = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 2800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    )
    b.start(); p.start()
    return () => { b.stop(); p.stop() }
  }, [])

  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] })
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.7] })
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] })

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute', width: size, height: size, borderRadius: size / 2,
          backgroundColor: color, opacity: ringOpacity, transform: [{ scale: ringScale }],
        }}
      />
      <Animated.Text style={{ fontSize: size * 0.5, transform: [{ scale }] }}>🪷</Animated.Text>
    </View>
  )
}
