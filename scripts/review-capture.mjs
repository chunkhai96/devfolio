// Captures the DESIGN.md §8 review snapshots from a production build (Safari engine).
//   node scripts/review-capture.mjs [baseUrl]
import { webkit, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'

const base = process.argv[2] ?? 'http://localhost:3400'
const out = 'docs/review/final'
await mkdir(out, { recursive: true })
const settle = ms => new Promise(r => setTimeout(r, ms))
const shot = (page, name) => page.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 82 })

async function open(ctx, path, wait = 3500) {
  const page = await ctx.newPage()
  await page.goto(base + path, { waitUntil: 'domcontentloaded' })
  if (!path.includes('nowebgl')) await page.waitForSelector('.stage.ready', { timeout: 90000 })
  await settle(wait)
  return page
}

const browser = await webkit.launch()

// desktop
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
let p = await open(desk, '/')
await shot(p, '01-desktop-arrival')
await p.getByRole('button', { name: 'Explore the atelier' }).click()
await settle(1500)
await shot(p, '02a-desktop-explore-markers')
await p.close()
p = await open(desk, '/?r=1#gallery')
await shot(p, '04a-gallery')
const m = p.locator('[data-marker="project-2"]')
if (await m.isVisible()) { await m.hover(); await settle(900) }
await shot(p, '02b-desktop-hover-exhibit')
await p.close()
for (const [hash, name] of [['#work/i-have-chosen-you', '03a-desktop-project-panel'], ['#lab', '04b-lab'], ['#corridor', '04c-corridor'], ['#terrace', '04d-terrace'], ['#contact', '04e-contact-panel'], ['#capabilities/0', '03b-capabilities-panel']]) {
  p = await open(desk, `/?r=${name}${hash}`)
  await shot(p, name)
  await p.close()
}
p = await open(desk, '/?r=close#work/rides')
await p.getByRole('button', { name: /Close/ }).click()
await settle(3000)
await shot(p, '03c-desktop-panel-closed-return')
await p.close()
p = await open(desk, '/?nowebgl', 1500)
await shot(p, '06b-desktop-webgl-fallback')
await p.close()
const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
p = await open(rm, '/?r=rm#corridor', 1500)
await shot(p, '06a-reduced-motion-corridor')
await p.close()

// tablet + phones
for (const [dev, tag] of [['iPad (gen 7)', 'tablet'], ['iPhone 15', 'phone'], ['iPhone SE', 'phone-se']]) {
  const ctx = await browser.newContext({ ...devices[dev] })
  p = await open(ctx, '/')
  await shot(p, `05-${tag}-arrival`)
  await p.getByRole('button', { name: 'View projects' }).tap()
  await settle(3500)
  await shot(p, `05-${tag}-room-guide`)
  await p.locator('.guide .item').nth(1).tap()
  await settle(3500)
  await shot(p, `05-${tag}-project-sheet`)
  await p.close()
}
await browser.close()
console.log('captured to', out)
