// Dev-only helpers for visual review against DESIGN.md (scene captures saved via /api/dev-capture).
export default defineNuxtPlugin(() => {
  if (!import.meta.dev) return
  const w = window as unknown as Record<string, unknown>
  const eng = () => w.__atelier as {
    capture: (t: string, q: number, w: number) => string
    goZone: (z: string, i?: boolean) => Promise<void>
    focus: (id: string, i?: boolean) => Promise<void>
    tune: (o: object) => void
  }
  w.__snap = async (name: string, width = 1280) => {
    const dataUrl = eng().capture('image/jpeg', 0.9, width)
    const r = await fetch('/api/dev-capture', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, dataUrl }) })
    return (await r.json()).file
  }
  /** Full-page frame: WebGL scene + DOM overlay composited at device resolution. */
  w.__shot = async (name: string, dir: 'review' | 'images' = 'review', width = 1800) => {
    const { toCanvas } = await import('html-to-image')
    const W = innerWidth
    const H = innerHeight
    const scale = width / W
    const sceneImg = new Image()
    sceneImg.src = eng().capture('image/png', 1, width)
    await new Promise(r => { sceneImg.onload = r; setTimeout(r, 3000) })
    const root = document.querySelector<HTMLElement>('.atelier')!
    const stage = document.querySelector<HTMLElement>('.stage-wrap')
    const prevBg = stage?.style.background ?? ''
    if (stage) stage.style.background = 'transparent'
    const overlay = await toCanvas(root, {
      width: W, height: H, pixelRatio: scale, cacheBust: true,
      filter: (n) => !(n instanceof HTMLCanvasElement) && !(n as HTMLElement).classList?.contains('poster') && !(n as HTMLElement).classList?.contains('nuxt-devtools-label'),
      style: { background: 'transparent' },
    }).finally(() => { if (stage) stage.style.background = prevBg })
    const c = document.createElement('canvas')
    c.width = width; c.height = Math.round(H * scale)
    const x = c.getContext('2d')!
    x.fillStyle = '#101419'; x.fillRect(0, 0, c.width, c.height)
    x.drawImage(sceneImg, 0, 0, c.width, c.height)
    x.drawImage(overlay, 0, 0, c.width, c.height)
    const dataUrl = c.toDataURL(dir === 'images' ? 'image/webp' : 'image/jpeg', 0.88)
    const r = await fetch('/api/dev-capture', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, dataUrl, dir }) })
    return (await r.json()).file
  }
  w.__view = async (z: string) => {
    await eng().goZone(z, true)
    eng().tune({ snap: true })
    return 'ok'
  }
  /**
   * WCAG contrast of hero copy against the rendered scene: page scrim and the hero's local
   * radial scrim are composited per pixel; background = 95th-percentile luminance under the text box.
   */
  w.__contrast = async (selector = '.hero .eyebrow, .hero h1, .hero-desc, .hero-roles, .resume, .hero .btn-ghost') => {
    const W = innerWidth
    const H = innerHeight
    const img = new Image()
    img.src = eng().capture('image/png', 1, W)
    await new Promise(r => { img.onload = r; setTimeout(r, 3000) })
    const c = document.createElement('canvas')
    c.width = W; c.height = H
    const x = c.getContext('2d')!
    x.drawImage(img, 0, 0, W, H)
    const lin = (v: number) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
    const lum = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
    const portrait = W <= 760 || W / H <= 0.8
    const pageA = (px: number, py: number) => {
      if (portrait) { const f = 1 - py / H; return f < 0.38 ? 0.88 + (0.6 - 0.88) * (f / 0.38) : f < 0.62 ? 0.6 * (1 - (f - 0.38) / 0.24) : 0 }
      const f = px / W; return f < 0.3 ? 0.72 + (0.45 - 0.72) * (f / 0.3) : f < 0.55 ? 0.45 * (1 - (f - 0.3) / 0.25) : 0
    }
    const hero = document.querySelector('.hero')!.getBoundingClientRect()
    const box = portrait
      ? { l: hero.left - 16, t: hero.top - 80, r: hero.right + 16, b: hero.bottom + 20 }
      : { l: hero.left - 160, t: hero.top - 90, r: hero.right + 140, b: hero.bottom + 80 }
    const localA = (px: number, py: number) => {
      if (portrait) { const f = (box.b - py) / (box.b - box.t); return f < 0.6 ? 0.9 : 0.9 * (1 - (f - 0.6) / 0.4) }
      const cx = (box.l + box.r) / 2; const cy = (box.t + box.b) / 2
      const rad = Math.min(box.r - box.l, box.b - box.t) / 2
      const d = Math.hypot(px - cx, py - cy) / rad
      return d < 0.55 ? 0.84 + (0.72 - 0.84) * (d / 0.55) : d < 1 ? 0.72 * (1 - (d - 0.55) / 0.45) : 0
    }
    const out: string[] = []
    for (const el of document.querySelectorAll<HTMLElement>(selector)) {
      const range = document.createRange()
      range.selectNodeContents(el)
      const r = range.getBoundingClientRect()
      const cs = getComputedStyle(el)
      const bgOwn = cs.backgroundColor.match(/[\d.]+/g)!.map(Number)
      const ownA = bgOwn.length === 4 ? bgOwn[3] : (bgOwn.some(v => v > 0) ? 1 : 0)
      const d = x.getImageData(Math.max(0, r.left | 0), Math.max(0, r.top | 0), Math.max(1, r.width | 0), Math.max(1, r.height | 0)).data
      const ls: number[] = []
      for (let i = 0; i < d.length; i += 4) {
        const px = r.left + ((i / 4) % Math.max(1, r.width | 0))
        const py = r.top + Math.floor((i / 4) / Math.max(1, r.width | 0))
        let [rr, gg, bb] = [d[i], d[i + 1], d[i + 2]]
        for (const a of [pageA(px, py), localA(px, py)]) { rr = rr * (1 - a) + 10 * a; gg = gg * (1 - a) + 13 * a; bb = bb * (1 - a) + 17 * a }
        if (ownA) { rr = rr * (1 - ownA) + bgOwn[0] * ownA; gg = gg * (1 - ownA) + bgOwn[1] * ownA; bb = bb * (1 - ownA) + bgOwn[2] * ownA }
        ls.push(lum(rr, gg, bb))
      }
      ls.sort((a, b) => a - b)
      const bgL = ls[Math.floor(ls.length * 0.95)]
      const fc = cs.color.match(/[\d.]+/g)!.map(Number)
      const op = Number(cs.opacity) * (fc[3] ?? 1)
      const fg = fc.slice(0, 3).map(v => v * op + 12 * (1 - op))
      const fl = lum(fg[0], fg[1], fg[2])
      out.push(`${el.className.split(' ')[0] || el.tagName}:${((Math.max(fl, bgL) + 0.05) / (Math.min(fl, bgL) + 0.05)).toFixed(1)}`)
    }
    return out.join(' ')
  }
})
