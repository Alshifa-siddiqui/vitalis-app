import { View, ScrollView } from 'react-native'
import { useColors } from './useColors'

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// GitHub-style contributions grid: columns = weeks, rows = weekdays.
export function Heatmap({ history, weeks = 13, color }: { history: string[]; weeks?: number; color?: string }) {
  const C = useColors()
  const done = new Set(history)
  const today = new Date()
  const todayStr = iso(today)
  const start = new Date(today)
  start.setDate(start.getDate() - ((weeks - 1) * 7 + today.getDay()))

  const cols = []
  for (let c = 0; c < weeks; c++) {
    const cells = []
    for (let r = 0; r < 7; r++) {
      const d = new Date(start)
      d.setDate(start.getDate() + c * 7 + r)
      const ds = iso(d)
      const future = ds > todayStr
      const bg = future ? 'transparent' : done.has(ds) ? (color ?? C.secondary) : C.lightmint
      cells.push(<View key={r} style={{ width: 13, height: 13, borderRadius: 3, margin: 2, backgroundColor: bg }} />)
    }
    cols.push(<View key={c}>{cells}</View>)
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row' }}>{cols}</View>
    </ScrollView>
  )
}
