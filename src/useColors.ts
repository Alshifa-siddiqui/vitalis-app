import { useStore } from './store'
import { LIGHT, DARK, type Palette } from './theme'

// Active palette, driven by the persisted dark-mode flag.
export function useColors(): Palette {
  return useStore((s) => s.dark) ? DARK : LIGHT
}
