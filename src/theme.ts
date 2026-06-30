// Vitalis design system — light + dark palettes.
// Brand greens stay constant; neutral surfaces/text flip between modes.
export const LIGHT = {
  forest: '#1B4332',    // headings / brand text
  hero: '#1B4332',      // hero card background (dark green in both modes)
  primary: '#2D6A4F',   // buttons, active accents
  mid: '#40916C',
  secondary: '#52B788',
  mint: '#95D5B2',
  lightmint: '#D8F3DC', // soft surface (chips, icon bg, tip cards)
  canvas: '#F8FFF8',    // app background
  card: '#FFFFFF',      // card surface
  gold: '#FFD166',
  warmgold: '#F4A261',
  success: '#06D6A0',
  error: '#EF476F',
  ink: '#1B2D24',       // primary text
  muted: '#6B8576',     // secondary text
  white: '#FFFFFF',     // always white (text on colored surfaces)
}

export type Palette = typeof LIGHT

export const DARK: Palette = {
  forest: '#B7E4C7',
  hero: '#1B4332',
  primary: '#40916C',
  mid: '#52B788',
  secondary: '#52B788',
  mint: '#95D5B2',
  lightmint: '#1E3A2A',
  canvas: '#0D1F17',
  card: '#16291E',
  gold: '#FFD166',
  warmgold: '#F4A261',
  success: '#06D6A0',
  error: '#EF476F',
  ink: '#EAF7EF',
  muted: '#8AA597',
  white: '#FFFFFF',
}

import { Platform } from 'react-native'

// Reusable soft card shadow — boxShadow on web (avoids the deprecated shadow*
// warning), native shadow props on device.
export const cardShadow = Platform.select({
  web: { boxShadow: '0 4px 10px rgba(0,0,0,0.08)' },
  default: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
}) as object

export const ICON_CHOICES = ['🏃', '💧', '🧘', '📖', '😴', '🥗', '🏋️', '🚶', '✍️', '🧠', '🦷', '☀️']
export const CATEGORIES = ['Fitness', 'Health', 'Mental', 'Learning', 'General']

// Brand fonts (loaded via @expo-google-fonts in App.tsx)
export const FONT = {
  display: 'PlayfairDisplay_700Bold',
  displayXL: 'PlayfairDisplay_800ExtraBold',
  sans: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  mono: 'DMMono_500Medium',
} as const
