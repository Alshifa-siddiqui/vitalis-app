import { useEffect, useState } from 'react'
import { AppState } from 'react-native'

// Lightweight connectivity detection without a native module (so it works in the
// current dev build with no rebuild). We reachability-check the Supabase host on
// mount, when the app is foregrounded, and on a slow interval.

const TARGET = process.env.EXPO_PUBLIC_SUPABASE_URL || ''

let online = true
const listeners = new Set<(v: boolean) => void>()

export const getOnline = () => online

function set(v: boolean) {
  if (v === online) return
  online = v
  listeners.forEach((l) => l(v))
}

async function check() {
  if (!TARGET) return // demo mode / no backend — assume online, no banner
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5000)
    // no-cors keeps this from false-failing on web; on native it's a normal HEAD.
    await fetch(TARGET, { method: 'HEAD', mode: 'no-cors', signal: ctrl.signal })
    clearTimeout(timer)
    set(true)
  } catch {
    set(false)
  }
}

// Subscribe a component to the online/offline state.
export function useOnline(): boolean {
  const [v, setV] = useState(online)
  useEffect(() => {
    listeners.add(setV)
    check()
    const interval = setInterval(check, 20000)
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') check()
    })
    return () => {
      listeners.delete(setV)
      clearInterval(interval)
      sub.remove()
    }
  }, [])
  return v
}
