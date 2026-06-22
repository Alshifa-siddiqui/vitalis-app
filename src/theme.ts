// Vitalis green design system (from the case study / Figma)
export const C = {
  forest: '#1B4332',
  primary: '#2D6A4F',
  mid: '#40916C',
  secondary: '#52B788',
  mint: '#95D5B2',
  lightmint: '#D8F3DC',
  canvas: '#F8FFF8',
  gold: '#FFD166',
  warmgold: '#F4A261',
  success: '#06D6A0',
  error: '#EF476F',
  ink: '#1B2D24',
  muted: '#6B8576',
  white: '#FFFFFF',
}

// Reusable soft card shadow (iOS + Android + web)
export const cardShadow = {
  shadowColor: '#1B4332',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const

export const ICON_CHOICES = ['🏃', '💧', '🧘', '📖', '😴', '🥗', '🏋️', '🚶', '✍️', '🧠', '🦷', '☀️']
export const CATEGORIES = ['Fitness', 'Health', 'Mental', 'Learning', 'General']

// Brand fonts (loaded via @expo-google-fonts in App.tsx)
export const FONT = {
  display: 'PlayfairDisplay_700Bold',     // headings
  displayXL: 'PlayfairDisplay_800ExtraBold',
  sans: 'DMSans_400Regular',              // body
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  mono: 'DMMono_500Medium',               // numbers / stats
} as const
