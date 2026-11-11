import * as THREE from 'three'

/**
 * OLED display surfaces. Everything shown here is also available as accessible HTML
 * in the panels — screens are visual evidence, never the only source of information.
 */
export interface AtelierContent {
  galleryTitle: string
  contact: { title: string, email: string }
  projects: { title: string, description: string, imageSrc: string }[]
  roles: string[]
  keyPoints: string[]
  tech: { text: string, svg?: string }[]
  experience: { title: string, company: string, duration: string }[]
  achievements: { title: string, provider: string, imageSrc: string }[]
  talks: { title: string, imageSrc: string }[]
}

const C = {
  ink: '#07090c', slate: '#11171d', graphite: '#303c48', titanium: '#8a969e',
  mist: '#d7dfdf', porcelain: '#f2f0e9', cyan: '#9ad8d6', warm: '#e6dfd3',
}
const DISPLAY = '"Space Grotesk Variable", "Space Grotesk", system-ui, sans-serif'
const BODY = '"Inter Variable", Inter, system-ui, sans-serif'
const MONO = '"IBM Plex Mono", ui-monospace, monospace'

const imageCache = new Map<string, Promise<HTMLImageElement>>()
function loadImage(src: string) {
  if (!imageCache.has(src)) {
    imageCache.set(src, new Promise((res, rej) => {
      const im = new Image()
      im.decoding = 'async'
      im.onload = () => res(im)
      im.onerror = rej
      im.src = src.startsWith('/') || src.startsWith('http') || src.startsWith('data:') ? src : '/' + src
    }))
  }
  return imageCache.get(src)!
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function cover(ctx: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number, alignY = 0.3, alignX = 0.5) {
  const s = Math.max(w / im.width, h / im.height)
  const iw = im.width * s
  const ih = im.height * s
  ctx.drawImage(im, x + (w - iw) * alignX, y + (h - ih) * alignY, iw, ih)
}

function contain(ctx: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.min(w / im.width, h / im.height)
  ctx.drawImage(im, x + (w - im.width * s) / 2, y + (h - im.height * s) / 2, im.width * s, im.height * s)
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines = 4) {
  const words = text.split(/\s+/)
  let line = ''
  let n = 0
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y + n * lh)
      line = w
      if (++n >= maxLines) return n
    } else line = test
  }
  if (line) { ctx.fillText(line, x, y + n * lh); n++ }
  return n
}

function vignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,0.35)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function grid(ctx: CanvasRenderingContext2D, w: number, h: number, step: number, alpha = 0.05) {
  ctx.strokeStyle = `rgba(215,223,223,${alpha})`
  ctx.lineWidth = 1
  for (let x = step; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke() }
  for (let y = step; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke() }
}

export async function drawProject(p: AtelierContent['projects'][0], _index: number, aspect: number) {
  // the screenshot alone: titles live in the HTML label and panel, never on top of the work
  const W = 1600
  const H = Math.round(W / aspect)
  const [c, ctx] = canvas(W, H)
  ctx.fillStyle = C.ink
  ctx.fillRect(0, 0, W, H)
  // left-anchored: site logos sit top-left, so crop the right edge instead
  try { cover(ctx, await loadImage(p.imageSrc), 0, 0, W, H, 0.25, 0) } catch { /* keep dark */ }
  vignette(ctx, W, H)
  return c
}

export function drawContact(title: string, email: string, aspect: number) {
  const W = 1024
  const H = Math.round(W / aspect)
  const [c, ctx] = canvas(W, H)
  ctx.fillStyle = C.ink
  ctx.fillRect(0, 0, W, H)
  const pad = 64
  ctx.fillStyle = C.cyan
  ctx.font = `500 24px ${MONO}`
  ctx.fillText('05 / CONNECTION TERRACE', pad, pad + 10)
  ctx.fillStyle = C.porcelain
  ctx.font = `600 74px ${DISPLAY}`
  ctx.fillText(title, pad, H * 0.56)
  ctx.fillStyle = C.mist
  ctx.font = `400 32px ${BODY}`
  ctx.fillText(email, pad, H * 0.56 + 58)
  ctx.strokeStyle = 'rgba(154,216,214,0.6)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(pad, H - pad - 40); ctx.lineTo(W - pad, H - pad - 40); ctx.stroke()
  ctx.fillStyle = C.titanium
  ctx.font = `500 22px ${MONO}`
  ctx.fillText('SELECT TO OPEN THE FORM', pad, H - pad)
  vignette(ctx, W, H)
  return c
}

/** Gallery terminus: every exhibit at a glance, real screenshots only. */
export async function drawIndex(title: string, projects: AtelierContent['projects'], aspect: number) {
  const W = 2400
  const H = Math.round(W / aspect)
  const [c, ctx] = canvas(W, H)
  ctx.fillStyle = C.ink
  ctx.fillRect(0, 0, W, H)
  const pad = 110
  ctx.fillStyle = C.titanium
  ctx.font = `500 30px ${MONO}`
  ctx.fillText(`02 / PROJECT GALLERY — ${String(projects.length).padStart(2, '0')} EXHIBITS`, pad, pad + 6)
  ctx.fillStyle = C.porcelain
  ctx.font = `600 96px ${DISPLAY}`
  ctx.fillText(title, pad, pad + 120)
  const cols = 3
  const gap = 36
  const top = pad + 190
  const cw = (W - pad * 2 - gap * (cols - 1)) / cols
  const rows = Math.ceil(projects.length / cols)
  const ch = (H - top - pad - gap * (rows - 1)) / rows
  for (let i = 0; i < projects.length; i++) {
    const x = pad + (i % cols) * (cw + gap)
    const y = top + Math.floor(i / cols) * (ch + gap)
    const ih = ch - 64
    ctx.save()
    ctx.beginPath(); ctx.rect(x, y, cw, ih); ctx.clip()
    try { cover(ctx, await loadImage(projects[i].imageSrc), x, y, cw, ih, 0.2) } catch { /* empty */ }
    ctx.restore()
    ctx.strokeStyle = 'rgba(138,150,158,0.3)'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, cw - 2, ih - 2)
    ctx.fillStyle = C.cyan
    ctx.font = `500 24px ${MONO}`
    ctx.fillText(String(i + 1).padStart(2, '0'), x, y + ih + 44)
    ctx.fillStyle = C.porcelain
    ctx.font = `500 36px ${DISPLAY}`
    ctx.fillText(projects[i].title, x + 56, y + ih + 46)
  }
  vignette(ctx, W, H)
  return c
}

const ROLE_ART: ((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void)[] = [
  // AI/ML — layered network: inputs fan into hidden layers, one highlighted path
  (ctx, x, y, w, h) => {
    const layers = [5, 7, 7, 4, 2]
    const pos = layers.map((n, li) => Array.from({ length: n }, (_, i) =>
      [x + (li / (layers.length - 1)) * w, y + h * (0.5 + (i - (n - 1) / 2) / 8)]))
    ctx.lineWidth = 1.2
    for (let l = 0; l < pos.length - 1; l++) {
      for (const a of pos[l]) for (const b of pos[l + 1]) {
        ctx.strokeStyle = 'rgba(138,150,158,0.22)'
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke()
      }
    }
    const path = [2, 3, 4, 1, 0]
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 3
    ctx.beginPath()
    path.forEach((pi, l) => { const p = pos[l][pi]; l ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]) })
    ctx.stroke()
    for (const [l, layer] of pos.entries()) for (const [i, p] of layer.entries()) {
      ctx.fillStyle = path[l] === i ? C.cyan : C.mist
      ctx.beginPath(); ctx.arc(p[0], p[1], path[l] === i ? 9 : 6, 0, Math.PI * 2); ctx.fill()
    }
  },
  // Full stack — three tiers with request/response flow
  (ctx, x, y, w, h) => {
    const tiers = ['Interface', 'Services', 'Data']
    const th = h / 4.2
    tiers.forEach((t, i) => {
      const ty = y + i * th * 1.4
      ctx.strokeStyle = i === 1 ? C.cyan : 'rgba(215,223,223,0.45)'
      ctx.lineWidth = i === 1 ? 3 : 2
      ctx.strokeRect(x + i * 24, ty, w - i * 48, th)
      ctx.fillStyle = C.mist
      ctx.font = `500 ${th * 0.32}px ${MONO}`
      ctx.fillText(t.toUpperCase(), x + i * 24 + 24, ty + th * 0.62)
      if (i < 2) {
        ctx.strokeStyle = 'rgba(154,216,214,0.7)'; ctx.lineWidth = 2
        const ax = x + w * 0.72
        ctx.beginPath(); ctx.moveTo(ax, ty + th); ctx.lineTo(ax, ty + th * 1.4); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(ax + 30, ty + th * 1.4); ctx.lineTo(ax + 30, ty + th); ctx.stroke()
      }
    })
  },
  // Data science — scatter with a fitted curve and confidence band
  (ctx, x, y, w, h) => {
    ctx.strokeStyle = 'rgba(215,223,223,0.35)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.stroke()
    const f = (u: number) => 0.75 - 0.5 * u + 0.18 * Math.sin(u * 5.5)
    let s = 7
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
    ctx.fillStyle = 'rgba(215,223,223,0.75)'
    for (let i = 0; i < 70; i++) {
      const u = rnd()
      const v = f(u) + (rnd() - 0.5) * 0.18
      ctx.beginPath(); ctx.arc(x + u * w, y + v * h, 4, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = 'rgba(154,216,214,0.12)'
    ctx.beginPath()
    for (let i = 0; i <= 60; i++) { const u = i / 60; ctx.lineTo(x + u * w, y + (f(u) - 0.09) * h) }
    for (let i = 60; i >= 0; i--) { const u = i / 60; ctx.lineTo(x + u * w, y + (f(u) + 0.09) * h) }
    ctx.fill()
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 3.5
    ctx.beginPath()
    for (let i = 0; i <= 60; i++) { const u = i / 60; i ? ctx.lineTo(x + u * w, y + f(u) * h) : ctx.moveTo(x, y + f(0) * h) }
    ctx.stroke()
  },
]

export function drawCapability(role: string, point: string, index: number, aspect: number) {
  const W = 1400
  const H = Math.round(W / aspect)
  const [c, ctx] = canvas(W, H)
  ctx.fillStyle = C.ink
  ctx.fillRect(0, 0, W, H)
  grid(ctx, W, H, 56, 0.035)
  const pad = 80
  ctx.fillStyle = C.titanium
  ctx.font = `500 26px ${MONO}`
  ctx.fillText(`CAPABILITY ${String(index + 1).padStart(2, '0')} / 03`, pad, pad + 10)
  ctx.fillStyle = C.porcelain
  ctx.font = `600 76px ${DISPLAY}`
  ctx.fillText(role, pad, pad + 110)
  ctx.fillStyle = C.mist
  ctx.font = `400 30px ${BODY}`
  wrap(ctx, point, pad, pad + 170, W * 0.42, 44, 5)
  ROLE_ART[index % ROLE_ART.length](ctx, W * 0.56, H * 0.24, W * 0.36, H * 0.56)
  vignette(ctx, W, H)
  return c
}

export async function drawStack(tech: AtelierContent['tech'], aspect: number) {
  const W = 2048
  const H = Math.round(W / aspect)
  const [c, ctx] = canvas(W, H)
  ctx.fillStyle = C.ink
  ctx.fillRect(0, 0, W, H)
  grid(ctx, W, H, 64, 0.03)
  const pad = 96
  ctx.fillStyle = C.titanium
  ctx.font = `500 30px ${MONO}`
  ctx.fillText('TOOLS IN DAILY USE', pad, pad + 6)
  const cols = 4
  const rows = Math.ceil(tech.length / cols)
  const cw = (W - pad * 2) / cols
  const ch = (H - pad * 2 - 60) / rows
  for (let i = 0; i < tech.length; i++) {
    const t = tech[i]
    const cx = pad + (i % cols) * cw
    const cy = pad + 60 + Math.floor(i / cols) * ch
    ctx.strokeStyle = 'rgba(138,150,158,0.25)'
    ctx.lineWidth = 2
    ctx.strokeRect(cx + 10, cy + 10, cw - 20, ch - 20)
    if (t.svg) {
      try {
        const im = await loadImage(t.svg)
        const s = ch * 0.34
        const [ic, ictx] = canvas(256, 256)
        ictx.drawImage(im, 0, 0, 256, 256)
        ictx.globalCompositeOperation = 'source-in'
        ictx.fillStyle = C.mist
        ictx.fillRect(0, 0, 256, 256)
        ctx.drawImage(ic, cx + 50, cy + 50, s, s)
      } catch { /* label only */ }
    }
    ctx.fillStyle = C.titanium
    ctx.font = `500 24px ${MONO}`
    ctx.fillText(String(i + 1).padStart(2, '0'), cx + cw - 80, cy + 64)
    ctx.fillStyle = C.porcelain
    ctx.font = `500 52px ${DISPLAY}`
    ctx.fillText(t.text, cx + 50, cy + ch - 56)
  }
  vignette(ctx, W, H)
  return c
}

export async function drawTalk(t: AtelierContent['talks'][0], aspect: number) {
  const W = 1600
  const H = Math.round(W / aspect)
  const [c, ctx] = canvas(W, H)
  ctx.fillStyle = C.ink
  ctx.fillRect(0, 0, W, H)
  try { cover(ctx, await loadImage(t.imageSrc), 0, 0, W, H, 0.5) } catch { /* dark */ }
  const g = ctx.createLinearGradient(0, H * 0.4, 0, H)
  g.addColorStop(0, 'rgba(7,9,12,0)')
  g.addColorStop(1, 'rgba(7,9,12,0.9)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = C.cyan
  ctx.font = `500 26px ${MONO}`
  ctx.fillText('TALK', 72, H - 160)
  ctx.fillStyle = C.porcelain
  ctx.font = `600 54px ${DISPLAY}`
  wrap(ctx, t.title, 72, H - 96, W - 144, 62, 2)
  vignette(ctx, W, H)
  return c
}

export function drawRole(r: AtelierContent['experience'][0], step: number, total: number, aspect: number) {
  const W = 1400
  const H = Math.round(W / aspect)
  const [c, ctx] = canvas(W, H)
  ctx.fillStyle = C.ink
  ctx.fillRect(0, 0, W, H)
  const pad = 84
  ctx.fillStyle = C.titanium
  ctx.font = `500 26px ${MONO}`
  ctx.fillText(`${String(step).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, pad, pad + 8)
  ctx.fillStyle = C.cyan
  ctx.fillText(r.duration.toUpperCase(), pad, H - pad)
  ctx.fillStyle = C.porcelain
  ctx.font = `600 70px ${DISPLAY}`
  const n = wrap(ctx, r.title, pad, pad + 140, W - pad * 2, 80, 2)
  ctx.fillStyle = C.mist
  ctx.font = `400 36px ${BODY}`
  wrap(ctx, r.company, pad, pad + 140 + n * 80 + 20, W - pad * 2, 48, 2)
  ctx.strokeStyle = 'rgba(138,150,158,0.35)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(pad, H - pad - 60); ctx.lineTo(W - pad, H - pad - 60); ctx.stroke()
  vignette(ctx, W, H)
  return c
}

export async function drawCert(a: AtelierContent['achievements'][0], aspect: number) {
  const W = 1024
  const H = Math.round(W / aspect)
  const [c, ctx] = canvas(W, H)
  ctx.fillStyle = '#ece9e1'
  ctx.fillRect(0, 0, W, H)
  try { contain(ctx, await loadImage(a.imageSrc), W * 0.16, H * 0.14, W * 0.68, H * 0.46) } catch { /* text only */ }
  ctx.fillStyle = '#1a2229'
  ctx.font = `600 34px ${DISPLAY}`
  ctx.textAlign = 'center'
  wrap(ctx, a.title, W / 2, H * 0.74, W * 0.84, 40, 2)
  ctx.fillStyle = '#56616b'
  ctx.font = `500 22px ${MONO}`
  ctx.fillText(a.provider.toUpperCase(), W / 2, H * 0.92)
  ctx.textAlign = 'left'
  return c
}

export function toTexture(c: HTMLCanvasElement, aniso: number) {
  const t = new THREE.CanvasTexture(c)
  t.flipY = false // glTF UV convention
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = aniso
  t.generateMipmaps = true
  t.minFilter = THREE.LinearMipmapLinearFilter
  return t
}

/** Glossy OLED: emissive content under a thin reflective cover glass. */
export function screenMaterial(tex: THREE.Texture, intensity: number, env: THREE.Texture | null) {
  return new THREE.MeshStandardMaterial({
    color: 0x000000, roughness: 0.14, metalness: 0, emissive: 0xffffff, emissiveMap: tex,
    emissiveIntensity: intensity, envMap: env, envMapIntensity: 0.55,
  })
}
