// Generates Vitalis app icon assets from an inline SVG lotus. Run: node scripts/gen-icons.mjs
import sharp from 'sharp'
import { mkdirSync } from 'fs'

const C = { forest: '#1B4332', primary: '#2D6A4F', mint: '#95D5B2', secondary: '#52B788', gold: '#FFD166', cream: '#FFF6E0' }
const CX = 512, CY = 512

function petalRing(radius, halfW, fill, count = 8, offset = 0) {
  const tip = CY - radius
  const mid = (CY + tip) / 2
  const d = `M${CX},${CY} Q ${CX - halfW},${mid} ${CX},${tip} Q ${CX + halfW},${mid} ${CX},${CY} Z`
  let g = ''
  for (let i = 0; i < count; i++) {
    const a = offset + i * (360 / count)
    g += `<path d="${d}" fill="${fill}" transform="rotate(${a} ${CX} ${CY})"/>`
  }
  return g
}

function lotus(mono = false) {
  const c = mono
    ? { o: '#FFFFFF', m: '#FFFFFF', i: '#FFFFFF', c1: '#FFFFFF', c2: '#FFFFFF' }
    : { o: C.mint, m: C.secondary, i: C.gold, c1: C.cream, c2: C.gold }
  return (
    petalRing(360, 64, c.o, 8, 0) +
    petalRing(270, 52, c.m, 8, 22.5) +
    petalRing(185, 40, c.i, 8, 0) +
    `<circle cx="${CX}" cy="${CY}" r="48" fill="${c.c1}"/>` +
    (mono ? '' : `<circle cx="${CX}" cy="${CY}" r="20" fill="${c.c2}"/>`)
  )
}

const wrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${inner}</svg>`
const scaled = (s) => `<g transform="translate(${512 - 512 * s}, ${512 - 512 * s}) scale(${s})">${lotus()}</g>`

// 1) Main icon — green gradient bg + lotus
const icon = wrap(`
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.primary}"/><stop offset="1" stop-color="${C.forest}"/>
  </linearGradient></defs>
  <rect width="1024" height="1024" fill="url(#g)"/>${scaled(0.82)}`)

const foreground = wrap(scaled(0.62))            // Android adaptive safe zone
const monochrome = wrap(`<g transform="translate(${512 - 512 * 0.62}, ${512 - 512 * 0.62}) scale(0.62)">${lotus(true)}</g>`)
const splash = wrap(scaled(0.7))
const adaptiveBg = wrap(`<rect width="1024" height="1024" fill="${C.forest}"/>`)

const A = './assets'
await Promise.all([
  sharp(Buffer.from(icon)).png().toFile(`${A}/icon.png`),
  sharp(Buffer.from(foreground)).png().toFile(`${A}/android-icon-foreground.png`),
  sharp(Buffer.from(monochrome)).png().toFile(`${A}/android-icon-monochrome.png`),
  sharp(Buffer.from(adaptiveBg)).png().toFile(`${A}/android-icon-background.png`),
  sharp(Buffer.from(splash)).png().toFile(`${A}/splash-icon.png`),
  sharp(Buffer.from(icon)).resize(48, 48).png().toFile(`${A}/favicon.png`),
])
console.log('✓ Generated Vitalis icon assets')
