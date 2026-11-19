// Simulated low-end device load check for the atelier.
//   node scripts/perf-check.mjs [baseUrl] [--cpu 6] [--runs 3] [--mobile] [--browser msedge] [--budget 200] [--json file]
//
// Loads the page in a Chromium-based browser with the CPU slowed down (Chrome DevTools' "CPU throttling"),
// waits until the 3D space is ready, and reports how long the main thread was frozen along the way:
//   worst    the longest single main-thread task (roughly the worst "page is stuck" moment)
//   blocking total blocking time: the sum of every task's time beyond 50 ms
//   ready    navigation start until the 3D space is interactive
// Each run uses a fresh browser profile, so it measures a first visit (cold cache).
//
// Throttling slows the CPU only: the GPU keeps its full speed, so a real low-end phone will still be
// slower at uploads and draws. Use a real device (see README) to confirm.
//
//   --cpu N       slowdown factor, 1 = none (default 6, DevTools' "mid-tier mobile" is about 4-6)
//   --runs N      runs to take the median of (default 3)
//   --mobile      emulate a phone (touch, small portrait screen); the site then uses its low-quality tier
//   --browser X   chrome | msedge | chromium (default: the first one installed)
//   --budget MS   exit with code 1 when the median worst freeze is above MS (for CI)
//   --json FILE   also write the raw results to FILE
import { chromium, devices } from 'playwright'
import { writeFile } from 'node:fs/promises'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i < 0 || argv[i + 1] === undefined ? fallback : argv[i + 1]
}
const base = (argv.find(a => /^https?:\/\//.test(a)) ?? 'http://localhost:3300').replace(/\/$/, '')
const cpu = Number(flag('cpu', 6))
const runs = Number(flag('runs', 3))
const mobile = argv.includes('--mobile')
const budget = flag('budget', null)
const jsonOut = flag('json', null)
const wanted = flag('browser', null)

async function launch() {
  const order = wanted ? [wanted] : ['chrome', 'msedge', 'chromium']
  for (const channel of order) {
    try {
      return { browser: await chromium.launch(channel === 'chromium' ? {} : { channel }), channel }
    } catch { /* not installed, try the next one */ }
  }
  console.error(`No Chromium-based browser found (tried ${order.join(', ')}). Install Chrome or Edge, or run: npx playwright install chromium`)
  process.exit(2)
}

// registered before any page script runs, so no long task is missed
const observe = () => {
  window.__longTasks = []
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__longTasks.push({ start: e.startTime, duration: e.duration })
  }).observe({ type: 'longtask', buffered: true })
}

const median = xs => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
const ms = n => `${Math.round(n)} ms`.padStart(8)

const { browser, channel } = await launch()
const results = []
console.log(`${base}  ·  ${channel}  ·  CPU ${cpu}x slower  ·  ${mobile ? 'phone (Pixel 7, low-quality tier)' : 'desktop 1440x900'}  ·  ${runs} run(s)\n`)

for (let run = 1; run <= runs; run++) {
  const ctx = await browser.newContext(mobile ? { ...devices['Pixel 7'] } : { viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message.slice(0, 160)))
  await page.addInitScript(observe)
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu })

  await page.goto(`${base}/?perf=${Date.now()}`, { waitUntil: 'domcontentloaded' })
  const renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2')
    const ext = gl?.getExtension('WEBGL_debug_renderer_info')
    return gl ? (ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'webgl2') : null
  })
  if (!renderer) {
    console.error('This browser has no WebGL 2, so the site shows its text edition and there is nothing to measure.')
    process.exit(2)
  }
  try {
    await page.waitForSelector('.stage.ready', { timeout: 120000 })
  } catch {
    console.error(`run ${run}: the 3D space never became ready (2 min timeout).`, errors.join(' | '))
    process.exit(2)
  }
  const ready = await page.evaluate(() => performance.now())
  await page.waitForTimeout(1500) // first frames after "ready" also count
  const tasks = await page.evaluate(() => window.__longTasks)
  const marks = await page.evaluate(() => performance.getEntriesByType('mark').map(m => [m.name, Math.round(m.startTime)]))
  const r = {
    run,
    readyMs: ready,
    worstMs: Math.max(0, ...tasks.map(t => t.duration)),
    blockingMs: tasks.reduce((s, t) => s + Math.max(0, t.duration - 50), 0),
    longTasks: tasks.length,
    over200: tasks.filter(t => t.duration > 200).length,
    tasks: tasks.map(t => [Math.round(t.start), Math.round(t.duration)]),
    marks, // any performance.mark() the page set, to line tasks up with app phases
    errors,
  }
  results.push(r)
  console.log(`run ${run}:  worst ${ms(r.worstMs)}  ·  blocking ${ms(r.blockingMs)}  ·  ready ${ms(r.readyMs)}  ·  ${r.longTasks} long tasks (${r.over200} over 200 ms)${errors.length ? `  ·  ${errors.length} page error(s)` : ''}`)
  await ctx.close()
}
await browser.close()

const summary = {
  worstMs: median(results.map(r => r.worstMs)),
  blockingMs: median(results.map(r => r.blockingMs)),
  readyMs: median(results.map(r => r.readyMs)),
}
console.log(`\nmedian: worst ${ms(summary.worstMs)}  ·  blocking ${ms(summary.blockingMs)}  ·  ready ${ms(summary.readyMs)}`)
console.log('(worst under ~200 ms reads as responsive; long freezes are what make the page feel stuck)')

if (jsonOut) await writeFile(jsonOut, JSON.stringify({ base, channel, cpu, mobile, summary, results }, null, 2))
if (budget !== null && summary.worstMs > Number(budget)) {
  console.error(`\nFAIL: median worst freeze ${Math.round(summary.worstMs)} ms is over the ${budget} ms budget`)
  process.exit(1)
}
