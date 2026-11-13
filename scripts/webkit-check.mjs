// Real-WebKit (Safari engine) device check for the atelier.
//   node scripts/webkit-check.mjs [baseUrl]
// Emulates iPhone SE / iPhone 15 / iPad (touch, DPR, Safari UA), taps through the core flows,
// records console errors and time-to-ready, saves screenshots and the ARIA tree to docs/review/webkit.
import { webkit, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'

const base = process.argv[2] ?? 'http://localhost:3300'
const out = 'docs/review/webkit'
await mkdir(out, { recursive: true })
const report = []

const ready = page => page.waitForSelector('.stage.ready', { timeout: 90000 })
const settle = ms => new Promise(r => setTimeout(r, ms))
const axe = async (page) => {
  await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' })
  return page.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] }))
    .violations.map(v => `${v.id} (${v.impact}) x${v.nodes.length}`))
}

for (const name of ['iPhone SE', 'iPhone 15', 'iPad (gen 7)']) {
  const browser = await webkit.launch()
  const ctx = await browser.newContext({ ...devices[name] })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)) })
  page.on('pageerror', e => errors.push('pageerror: ' + e.message.slice(0, 160)))
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')
  const r = { device: name }
  const t0 = Date.now()
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' })
  r.heroVisibleMs = await page.waitForSelector('#hero-title', { timeout: 30000 }).then(() => Date.now() - t0)
  r.webgl2 = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl2'))
  await ready(page)
  r.readyMs = Date.now() - t0
  await settle(2500)
  await page.screenshot({ path: `${out}/${slug}-1-arrival.jpg`, type: 'jpeg', quality: 78 })
  r.axeArrival = await axe(page)

  // tap through: View projects -> first project chip -> panel -> close
  await page.getByRole('button', { name: 'View projects' }).tap()
  await settle(3500)
  await page.screenshot({ path: `${out}/${slug}-2-gallery.jpg`, type: 'jpeg', quality: 78 })
  await writeFile(`${out}/${slug}-aria-guide.yml`, await page.locator('body').ariaSnapshot())
  r.axeGuide = await axe(page)
  await page.locator('.guide .item').first().tap()
  await settle(3500)
  r.panelOpen = await page.locator('.panel[role=dialog]').isVisible()
  r.panelTitle = await page.locator('#panel-title').textContent()
  r.focusInPanel = await page.evaluate(() => document.activeElement?.id)
  await page.screenshot({ path: `${out}/${slug}-3-panel.jpg`, type: 'jpeg', quality: 78 })
  await writeFile(`${out}/${slug}-aria-panel.yml`, await page.locator('[role=dialog]').ariaSnapshot())
  r.axePanel = await axe(page)
  await page.getByRole('button', { name: /Close/ }).tap()
  await settle(2500)
  r.panelClosed = !(await page.locator('.panel[role=dialog]').count())
  r.hashAfterClose = await page.evaluate(() => location.hash)

  // contact form reachable and labelled on touch
  await page.goto(base + '/?r=2#contact', { waitUntil: 'domcontentloaded' })
  await ready(page)
  await settle(3000)
  r.contactFields = await page.locator('.panel input, .panel textarea').count()
  r.axeContact = await axe(page)
  await page.screenshot({ path: `${out}/${slug}-4-contact.jpg`, type: 'jpeg', quality: 78 })

  // what VoiceOver gets: the accessibility (ARIA) tree of the arrival state
  await page.goto(base + '/?r=3', { waitUntil: 'domcontentloaded' })
  await ready(page)
  await writeFile(`${out}/${slug}-aria.yml`, await page.locator('body').ariaSnapshot())

  // reduced motion honoured by Safari media query
  const rm = await browser.newContext({ ...devices[name], reducedMotion: 'reduce' })
  const p2 = await rm.newPage()
  await p2.goto(base + '/', { waitUntil: 'domcontentloaded' })
  await ready(p2)
  r.reducedMotionDetected = await p2.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const tStart = Date.now()
  await p2.getByRole('button', { name: 'View projects' }).tap()
  await p2.waitForFunction(() => location.hash === '#gallery')
  r.reducedTapToHashMs = Date.now() - tStart
  r.reducedCssTransitionsOff = await p2.evaluate(() => getComputedStyle(document.querySelector('.btn')).transitionDuration)
  r.errors = errors
  report.push(r)
  await browser.close()
}

await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
