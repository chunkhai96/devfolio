// Motion evidence for the DESIGN.md §8 review: frame strips (and WebM recordings) of camera
// travel and panel transitions, captured from the production build in the Safari engine.
//   node scripts/motion-capture.mjs [baseUrl]
import { webkit } from 'playwright'
import { mkdir, readFile, rm } from 'node:fs/promises'

const base = process.argv[2] ?? 'http://localhost:3400'
const out = 'docs/review/motion'
await mkdir(out, { recursive: true })
const settle = ms => new Promise(r => setTimeout(r, ms))

const browser = await webkit.launch()
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
  recordVideo: { dir: `${out}/video`, size: { width: 1440, height: 900 } },
})

/** Grab frames for `ms` after `act()` starts; returns [{t, png}] */
async function sample(page, act, ms, every = 140) {
  const frames = []
  const t0 = Date.now()
  await act()
  while (Date.now() - t0 < ms) {
    const png = await page.screenshot({ type: 'jpeg', quality: 70 })
    frames.push({ t: Date.now() - t0, png })
    const wait = every - ((Date.now() - t0) % every)
    await settle(wait)
  }
  return frames
}

/** Lay frames out as a labelled contact sheet and save it as one JPEG. */
async function sheet(name, title, frames, pick = 8) {
  const step = Math.max(1, (frames.length - 1) / (pick - 1))
  const chosen = Array.from({ length: Math.min(pick, frames.length) }, (_, i) => frames[Math.round(i * step)])
  const cells = chosen.map(f => `<figure><img src="data:image/jpeg;base64,${f.png.toString('base64')}"><figcaption>t = ${(f.t / 1000).toFixed(2)} s</figcaption></figure>`).join('')
  const html = `<html><body style="margin:0;background:#0b0e12;color:#c9ced4;font:14px/1.3 -apple-system,system-ui,sans-serif">
    <h1 style="font-size:18px;font-weight:600;margin:16px 20px 8px">${title}</h1>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:8px 20px 20px">${cells}</div>
    <style>figure{margin:0}img{width:100%;display:block;border-radius:4px}figcaption{padding:4px 2px 0;font:12px ui-monospace,monospace;color:#8b939c}</style>
  </body></html>`
  const p = await browser.newPage({ viewport: { width: 1600, height: 300 } })
  await p.setContent(html)
  await p.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 84, fullPage: true })
  await p.close()
}

const page = await ctx.newPage()
await page.goto(base + '/', { waitUntil: 'domcontentloaded' })
await page.waitForSelector('.stage.ready', { timeout: 90000 })
await settle(3500)

// 1. arrival -> explore -> walk into the gallery through the portal
let f = await sample(page, () => page.getByRole('button', { name: 'View projects' }).click(), 3600)
await sheet('07a-travel-atrium-to-gallery', 'Camera travel: atrium → gallery (“View projects”), routed through the portal', f)
await settle(800)

// 2. open an exhibit: camera reframes the screen while the panel slides in
f = await sample(page, () => page.locator('.guide .item').nth(1).click(), 2600)
await sheet('07b-open-exhibit', 'Exhibit focus: camera reframes beside the panel as it opens', f)
await settle(600)

// 3. close: back to the room overview
f = await sample(page, () => page.getByRole('button', { name: /Close/ }).click(), 2400)
await sheet('07c-close-exhibit', 'Close: panel exits, camera returns to the gallery overview', f)

// 4. long route: gallery -> corridor -> terrace
f = await sample(page, () => page.evaluate(() => { location.hash = '#terrace' }), 6200, 180)
await sheet('07d-travel-gallery-to-terrace', 'Camera travel: gallery → atrium → corridor → terrace', f, 12)

await settle(500)
const vid = page.video()
await page.close()
await ctx.close()
if (vid) {
  await vid.saveAs(`${out}/atelier-walkthrough.webm`)
  await rm(`${out}/video`, { recursive: true, force: true })
}
await browser.close()
console.log('motion evidence in', out, (await readFile(`${out}/07a-travel-atrium-to-gallery.jpg`)).length > 0 ? 'ok' : '')
