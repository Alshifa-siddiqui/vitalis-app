// Generates Play Store listing assets from the Vitalis lotus branding.
// Run: node scripts/gen-store-assets.mjs
//   assets/play-icon-512.png   — 512x512 hi-res listing icon
//   assets/feature-graphic.png — 1024x500 feature graphic
import sharp from 'sharp'

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

function lotus() {
  return (
    petalRing(360, 64, C.mint, 8, 0) +
    petalRing(270, 52, C.secondary, 8, 22.5) +
    petalRing(185, 40, C.gold, 8, 0) +
    `<circle cx="${CX}" cy="${CY}" r="48" fill="${C.cream}"/>` +
    `<circle cx="${CX}" cy="${CY}" r="20" fill="${C.gold}"/>`
  )
}

const gradient = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${C.primary}"/><stop offset="1" stop-color="${C.forest}"/>
</linearGradient></defs>`

// 1) 512 hi-res icon (green gradient bg + lotus)
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${gradient}<rect width="1024" height="1024" fill="url(#g)"/>
  <g transform="translate(${512 - 512 * 0.82}, ${512 - 512 * 0.82}) scale(0.82)">${lotus()}</g>
</svg>`

// 2) Feature graphic 1024x500 — lotus on the left, wordmark + tagline on the right
const feature = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  ${gradient}<rect width="1024" height="500" fill="url(#g)"/>
  <g transform="translate(-26,-6) scale(0.5)">${lotus()}</g>
  <text x="470" y="235" font-family="Georgia, 'Times New Roman', serif" font-size="118" font-weight="700" fill="${C.cream}">Vitalis</text>
  <text x="474" y="300" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="${C.mint}">Build habits, feel your best.</text>
  <text x="474" y="352" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="${C.gold}">Streaks · Wellness score · AI coach</text>
</svg>`

const A = './assets'
await Promise.all([
  sharp(Buffer.from(icon)).resize(512, 512).png().toFile(`${A}/play-icon-512.png`),
  sharp(Buffer.from(feature)).png().toFile(`${A}/feature-graphic.png`),
])
console.log('✓ Generated Play Store assets: play-icon-512.png (512x512), feature-graphic.png (1024x500)')
