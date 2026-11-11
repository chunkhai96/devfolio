import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import {
  EffectComposer, RenderPass, EffectPass, BloomEffect, ToneMappingEffect, ToneMappingMode,
  VignetteEffect, SMAAEffect, Effect, NoiseEffect, BlendFunction, BrightnessContrastEffect,
} from 'postprocessing'
import { MaterialLibrary, patchMaterial, SPECS } from './materials'
import { Sculpture } from './sculpture'
import { createSky } from './sky'
import { createShaft } from './shaft'
import { loadProps } from './props'
import { ShiftCamera, CameraRig } from './camera'
import {
  type AtelierContent, drawProject, drawIndex, drawContact, drawCapability, drawStack, drawTalk, drawRole, drawCert, toTexture, screenMaterial,
} from './screens'
import { type Zone, type Pose, ZONES, ZONE_STATIONS, FOCUS_POSES, PROBES, BOUNDS, route, zoneAt, b } from './stations'

export interface Interactable {
  id: string
  hit: string
  zone: Zone
  label: string
  kind: 'destination' | 'exhibit' | 'feature'
  screen?: string
  dest?: Zone
  /** show an HTML marker (default true); dense groups expose one representative marker */
  marker?: boolean
}

export interface EngineCallbacks {
  onProgress?: (loaded: number, total: number) => void
  onHover?: (id: string | null) => void
  onActivate?: (it: Interactable) => void
  onZone?: (zone: Zone) => void
  onMoving?: (moving: boolean) => void
  onPerf?: (info: { dpr: number, fps: number }) => void
}

export interface EngineOptions {
  canvas: HTMLCanvasElement
  markerHost?: HTMLElement | null
  content: AtelierContent
  interactables: Interactable[]
  lowQuality: boolean
  reducedMotion: boolean
  callbacks: EngineCallbacks
  base?: string
}

class ExposureEffect extends Effect {
  constructor() {
    super('ExposureEffect', /* glsl */`
      uniform float exposure;
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        outputColor = vec4(inputColor.rgb * exposure, inputColor.a);
      }`, { uniforms: new Map([['exposure', new THREE.Uniform(1)]]) })
  }
  set exposure(v: number) { this.uniforms.get('exposure')!.value = v }
  get exposure() { return this.uniforms.get('exposure')!.value }
}

const EMISSIVE: Record<string, THREE.Material> = {}
/** Per-room balance on top of the shared bake: wings sit a little lower than the atrium. */
const ZONE_LM: Record<Zone, number> = { atrium: 1.0, gallery: 0.95, lab: 1.25, corridor: 1.05, terrace: 1.25 }
/** Per-room surface tweaks: lit niches and table tops shouldn't read as paper-white. */
const ZONE_COLOR: Partial<Record<Zone, Record<string, string>>> = {
  // each room keeps the campus materials but shifts their emphasis (DESIGN §3.2)
  gallery: { stone_wall: '#9e9b96', ceramic: '#e4ddd2', plaster: '#5d5c5a' },     // warm exhibition hall
  lab: { stone_wall: '#7c8998', fabric: '#4c5560', ceramic: '#a9a398' },           // cool acoustic studio
  corridor: { stone_wall: '#68737f', ceramic: '#b9b3a9' },                         // deep graphite procession
  terrace: { plaster: '#d8d4cc', stone_wall: '#6a6f76' },
}
const ZONE_FILL: Record<Zone, [number, number, number]> = {
  atrium: [0.035, 0.04, 0.05], gallery: [0.05, 0.055, 0.065], lab: [0.2, 0.205, 0.22],
  corridor: [0.07, 0.075, 0.09], terrace: [0.14, 0.15, 0.2],
}
const ZONE_EMIT: Record<Zone, number> = { atrium: 5.0, gallery: 1.6, lab: 3.2, corridor: 2.2, terrace: 3.0 }

export class AtelierEngine {
  private renderer!: THREE.WebGLRenderer
  private composer!: EffectComposer
  private scene = new THREE.Scene()
  private camera = new ShiftCamera(45, 1, 0.2, 1500)
  private rig!: CameraRig
  private clock = new THREE.Timer()
  private sculpture: Sculpture | null = null
  private sky = createSky()
  private shaft = createShaft(b(0, 0, 11.8), 0.6, 2.9, 3.3)
  private exposureFx = new ExposureEffect()
  private vignette!: VignetteEffect
  private toneFx!: ToneMappingEffect
  private contrastFx = new BrightnessContrastEffect({ contrast: 0.1 })
  private colliders: THREE.Object3D[] = []
  private hitMeshes = new Map<string, THREE.Mesh>()
  private screens = new Map<string, THREE.Mesh>()
  private highlights = new Map<string, THREE.Mesh>()
  private envs = new Map<Zone, THREE.Texture>()
  private zoneMaterials = new Map<Zone, THREE.MeshStandardMaterial[]>()
  private raycaster = new THREE.Raycaster()
  private pointerNdc = new THREE.Vector2(9, 9)
  private pointerDirty = false
  private hovered: string | null = null
  private keyFocused: string | null = null
  private zone: Zone = 'atrium'
  private disposed = false
  private raf = 0
  private dprCap = 1.75
  private dpr = 1
  private frameTimes: number[] = []
  private panelOpen = false
  private exposure = 1
  private exposureTarget = 1
  private markers = new Map<string, HTMLElement>()
  private drag: { x: number, y: number, moved: boolean, id: number } | null = null
  private time = 0
  private size = new THREE.Vector2(1, 1)
  private inset = { right: 0, bottom: 0, left: 0, guideBottom: 0 }
  private focusId: string | null = null
  private interactables: Interactable[]
  private byHit = new Map<string, Interactable[]>()

  constructor(private o: EngineOptions) {
    this.interactables = o.interactables
    for (const it of o.interactables) {
      if (!this.byHit.has(it.hit)) this.byHit.set(it.hit, [])
      this.byHit.get(it.hit)!.push(it)
    }
  }

  get portrait() { return this.size.y > this.size.x * 1.05 }
  get currentZone() { return this.zone }

  async init() {
    const { canvas, lowQuality } = this.o
    const base = this.o.base ?? ''
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false, depth: true })
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.NoToneMapping
    this.dprCap = lowQuality ? 1.5 : 1.75
    this.dpr = Math.min(window.devicePixelRatio || 1, this.dprCap)
    this.renderer.setPixelRatio(this.dpr)
    this.scene.fog = new THREE.FogExp2(new THREE.Color(0.012, 0.014, 0.018), 0.0045)
    this.scene.add(this.sky.group)
    this.scene.add(this.shaft.mesh)

    const startPose = this.stationPose('atrium')
    this.rig = new CameraRig(this.camera, startPose)
    this.rig.reducedMotion = this.o.reducedMotion

    // --- asset loading -------------------------------------------------------
    const texLoader = new THREE.TextureLoader()
    const gltf = new GLTFLoader()
    gltf.setMeshoptDecoder(MeshoptDecoder)
    const lmSuffix = lowQuality ? '_m' : ''
    const total = 1 + ZONES.length + 21
    let loaded = 0
    const tick = () => { loaded++; this.o.callbacks.onProgress?.(loaded, total) }
    this.o.callbacks.onProgress?.(0, total)

    const lib = new MaterialLibrary(
      { loadAsync: (url: string) => texLoader.loadAsync(url).then((t) => { tick(); return t }) } as unknown as THREE.TextureLoader,
      Math.min(8, this.renderer.capabilities.getMaxAnisotropy()), base + '/atelier', lowQuality)

    const [glb, lightmaps] = await Promise.all([
      gltf.loadAsync(base + '/atelier/world.glb').then((g) => { tick(); return g }),
      Promise.all(ZONES.map(z => texLoader.loadAsync(`${base}/atelier/lm_${z}${lmSuffix}.webp`).then((t) => {
        tick()
        t.flipY = false
        t.channel = 1
        t.colorSpace = THREE.NoColorSpace
        t.generateMipmaps = true
        t.minFilter = THREE.LinearMipmapLinearFilter
        t.anisotropy = 4
        return [z, t] as const
      }))),
      lib.load(),
    ])
    const lm = new Map(lightmaps)

    // --- world assembly --------------------------------------------------------
    const world = glb.scene
    const zoneOf = (o: THREE.Object3D): Zone | null => {
      let n: THREE.Object3D | null = o
      while (n) {
        const m = n.name.match(/^(atrium|gallery|lab|corridor|terrace)_(lm|metal|fx)/)
        if (m) return m[1] as Zone
        n = n.parent
      }
      return null
    }
    const groupOf = (o: THREE.Object3D) => {
      let n: THREE.Object3D | null = o
      while (n) {
        const m = n.name.match(/_(lm|metal|fx)(_\d+)?$/)
        if (m) return m[1]
        n = n.parent
      }
      return ''
    }
    const matCache = new Map<string, THREE.Material>()
    const meshes: THREE.Mesh[] = []
    world.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh) })
    for (const mesh of meshes) {
      const name = mesh.name || mesh.parent?.name || ''
      const nodeName = mesh.parent && mesh.parent.type === 'Group' && !mesh.name.startsWith('hit_') && !mesh.name.startsWith('screen_') ? mesh.parent.name : mesh.name
      if (nodeName.startsWith('hit_') || name.startsWith('hit_')) {
        const hn = nodeName.startsWith('hit_') ? nodeName : name
        mesh.visible = false
        mesh.name = hn
        this.hitMeshes.set(hn, mesh)
        this.colliders.push(mesh)
        continue
      }
      if (nodeName.startsWith('screen_') || name.startsWith('screen_')) {
        const sn = nodeName.startsWith('screen_') ? nodeName : name
        mesh.name = sn
        this.screens.set(sn, mesh)
        continue
      }
      const zone = zoneOf(mesh)
      const grp = groupOf(mesh)
      const mname = (mesh.material as THREE.Material).name
      if (!zone) continue
      if (grp === 'lm' || grp === 'metal') {
        const key = `${zone}:${mname}`
        let mat = matCache.get(key) as THREE.MeshStandardMaterial | undefined
        if (!mat) {
          if (!lib.has(mname)) { mesh.visible = false; continue }
          mat = lib.instance(mname)
          const zc = ZONE_COLOR[zone]?.[mname]
          if (zc) mat.color.set(zc)
          if (SPECS[mname].lightmapped) {
            mat.lightMap = lm.get(zone)!
            mat.lightMapIntensity = Math.PI * ZONE_LM[zone]
          }
          const [mn, mx] = BOUNDS[zone]
          const box = zone === 'terrace' ? null : { min: mn, max: mx, probe: PROBES[zone] }
          if (SPECS[mname].lightmapped) patchMaterial(mat, box, mname === 'basalt_floor' ? 2.2 : 1.4, ZONE_FILL[zone])
          if (mat.vertexColors && !mesh.geometry.getAttribute('color')) mat.vertexColors = false
          matCache.set(key, mat)
          if (!this.zoneMaterials.has(zone)) this.zoneMaterials.set(zone, [])
          this.zoneMaterials.get(zone)!.push(mat)
        }
        mesh.material = mat
        if (grp === 'lm') this.colliders.push(mesh)
      } else if (grp === 'fx') {
        mesh.material = this.fxMaterial(mname, zone)
        if (mname === 'glass' && zone) {
          if (!this.zoneMaterials.has(zone)) this.zoneMaterials.set(zone, [])
          this.zoneMaterials.get(zone)!.push(mesh.material as THREE.MeshStandardMaterial)
        }
      }
    }
    if (!this.hitMeshes.has('hit_dest_terrace')) {
      const h = new THREE.Mesh(new THREE.BoxGeometry(7, 6, 0.8))
      h.position.copy(b(0, 34, 3))
      h.name = 'hit_dest_terrace'
      h.visible = false
      world.add(h)
      this.hitMeshes.set(h.name, h)
      this.colliders.push(h)
    }
    world.updateMatrixWorld(true)
    this.scene.add(world)

    // terrace podium so the parapet edge never reveals a void
    const pod = new THREE.Mesh(new THREE.BoxGeometry(25.4, 40, 14), new THREE.MeshBasicMaterial({ color: 0x07090b }))
    pod.position.copy(b(0, 40.6, -20.3))
    this.scene.add(pod)

    // realtime lights: only metals / screens / sculpture respond (baked surfaces opt out in-shader)
    const key = new THREE.SpotLight(new THREE.Color(1.0, 0.93, 0.85), 260, 16, THREE.MathUtils.degToRad(24), 0.55, 1.4)
    key.position.copy(b(0, 0, 11.6))
    key.target.position.copy(b(0, 0, 4.0))
    this.scene.add(key, key.target)
    for (const [x, y, z, c, i] of [[3.2, -2.8, 1.2, 0xffd9b0, 9], [-3.0, 2.6, 1.0, 0xffe6cc, 7], [0.5, -3.6, 8.6, 0xdde8f0, 6]] as const) {
      const pl = new THREE.PointLight(c, i, 9, 1.6)
      pl.position.copy(b(x, y, z))
      this.scene.add(pl)
    }

    // sculpture
    this.sculpture = new Sculpture(null, lowQuality)
    this.sculpture.setStill(this.o.reducedMotion)
    this.scene.add(this.sculpture.group)

    // scanned furniture (CC0, Poly Haven) — lit by the zone probes once they exist
    const props = await loadProps(gltf, base, this.scene, z => this.envs.get(z)).catch((err) => {
      console.warn('[atelier] props unavailable', err)
      return null
    })

    // screens get their content
    await document.fonts?.ready
    await this.buildScreens()

    // reflection probes: two passes so metals see metals
    this.renderer.setSize(canvas.clientWidth || 1, canvas.clientHeight || 1, false)
    this.renderProbes(lowQuality ? 128 : 256)
    props?.applyEnv()

    this.setupComposer()
    this.bindEvents()
    this.resize()
    this.exposure = 0.0
    this.exposureTarget = 1
    this.loop()
  }

  // ---------------------------------------------------------------------------
  private fxMaterial(name: string, zone: Zone | null) {
    const key = name === 'emit_warm' ? `${name}:${zone}` : name
    if (name === 'glass') {
      return new THREE.MeshStandardMaterial({ color: 0x0b0f12, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.22, depthWrite: false, envMapIntensity: 1.2 })
    }
    if (EMISSIVE[key]) return EMISSIVE[key]
    let m: THREE.Material
    switch (name) {
      case 'emit_warm': m = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.8, 0.62).multiplyScalar(ZONE_EMIT[zone ?? 'atrium']), fog: false }); break
      case 'emit_cyan': m = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 0.85, 0.84).multiplyScalar(2.2), fog: false }); break
      case 'sky': m = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.05, 0.075, 0.13), fog: false }); break
      case 'water': m = this.sky.waterMaterial; break
      default: m = new THREE.MeshBasicMaterial({ color: 0x050607 })
    }
    EMISSIVE[key] = m
    return m
  }

  private screenGeom(mesh: THREE.Mesh) {
    const p = mesh.geometry.getAttribute('position') as THREE.BufferAttribute
    const uv = mesh.geometry.getAttribute('uv') as THREE.BufferAttribute
    const v = [0, 1, 2, 3].map(i => new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld))
    // identify corners by uv so orientation is robust to index order
    const byUv = (u: number, w: number) => {
      let best = 0
      let bd = 9
      for (let i = 0; i < 4; i++) {
        const d = Math.abs(uv.getX(i) - u) + Math.abs(uv.getY(i) - w)
        if (d < bd) { bd = d; best = i }
      }
      return v[best]
    }
    // glTF flips V: uv (0,1) is bottom-left in our Blender quads
    const bl = byUv(0, 1)
    const br = byUv(1, 1)
    const tl = byUv(0, 0)
    const center = v.reduce((a, c) => a.add(c), new THREE.Vector3()).multiplyScalar(0.25)
    const right = br.clone().sub(bl)
    const up = tl.clone().sub(bl)
    const normal = new THREE.Vector3().crossVectors(right, up).normalize()
    return { center, width: right.length(), height: up.length(), normal, right: right.normalize(), up: up.normalize() }
  }

  private async buildScreens() {
    const c = this.o.content
    const aniso = Math.min(8, this.renderer.capabilities.getMaxAnisotropy())
    const jobs: Promise<void>[] = []
    for (const [name, mesh] of this.screens) {
      const g = this.screenGeom(mesh)
      const aspect = g.width / g.height
      const zone = zoneAt(g.center)
      const set = (cv: HTMLCanvasElement, intensity: number) => {
        mesh.material = screenMaterial(toTexture(cv, aniso), intensity, null)
        ;(mesh.material as THREE.MeshStandardMaterial).userData.zone = zone
      }
      let m: RegExpMatchArray | null
      if ((m = name.match(/^screen_project_(\d)/))) {
        const i = +m[1]
        if (c.projects[i]) jobs.push(drawProject(c.projects[i], i, aspect).then(cv => set(cv, 1.45)))
      } else if ((m = name.match(/^screen_cap_(\d)/))) {
        const i = +m[1]
        set(drawCapability(c.roles[i] ?? '', c.keyPoints[i] ?? '', i, aspect), 1.0)
      } else if (name === 'screen_contact') {
        set(drawContact(c.contact.title, c.contact.email, aspect), 0.9)
      } else if (name === 'screen_gallery_index') {
        jobs.push(drawIndex(c.galleryTitle, c.projects, aspect).then(cv => set(cv, 1.1)))
      } else if (name === 'screen_stack') {
        jobs.push(drawStack(c.tech, aspect).then(cv => set(cv, 0.95)))
      } else if (name === 'screen_talk') {
        if (c.talks[0]) jobs.push(drawTalk(c.talks[0], aspect).then(cv => set(cv, 1.0)))
      } else if ((m = name.match(/^screen_role_(\d)/))) {
        const i = +m[1] // niche 0 = oldest role
        const n = c.experience.length
        const r = c.experience[n - 1 - i]
        if (r) set(drawRole(r, i + 1, n, aspect), 0.95)
      } else if ((m = name.match(/^screen_cert_(\d)/))) {
        const i = +m[1]
        if (c.achievements[i]) jobs.push(drawCert(c.achievements[i], aspect).then(cv => set(cv, 0.2)))
      }
      // hover outline: four thin bars around the glass, cyan, faded in on hover
      const frame = this.makeOutline(g)
      frame.visible = false
      this.scene.add(frame)
      this.highlights.set(name, frame)
    }
    await Promise.all(jobs)
  }

  private makeOutline(g: ReturnType<AtelierEngine['screenGeom']>) {
    const grp = new THREE.Group() as unknown as THREE.Mesh
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 0.85, 0.84).multiplyScalar(3.2), transparent: true, opacity: 0, fog: false, depthWrite: false })
    const t = 0.024
    const pad = 0.075
    const w = g.width + pad * 2
    const h = g.height + pad * 2
    const bars: [number, number, number, number][] = [
      [0, h / 2, w + t, t], [0, -h / 2, w + t, t], [-w / 2, 0, t, h], [w / 2, 0, t, h]]
    const basis = new THREE.Matrix4().makeBasis(g.right, g.up, g.normal)
    for (const [x, y, bw, bh] of bars) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), mat)
      m.position.set(x, y, 0.004)
      grp.add(m)
    }
    grp.matrixAutoUpdate = false
    grp.matrix.copy(basis).setPosition(g.center)
    grp.userData.mat = mat
    return grp
  }

  private renderProbes(res: number) {
    const rt = new THREE.WebGLCubeRenderTarget(res, { type: THREE.HalfFloatType, generateMipmaps: false })
    const cube = new THREE.CubeCamera(0.05, 1000, rt)
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    const hiddenFx: THREE.Object3D[] = []
    for (let pass = 0; pass < 2; pass++) {
      for (const z of ZONES) {
        cube.position.copy(PROBES[z])
        cube.update(this.renderer, this.scene)
        const env = pmrem.fromCubemap(rt.texture).texture
        this.envs.get(z)?.dispose()
        this.envs.set(z, env)
      }
      for (const [z, mats] of this.zoneMaterials) {
        for (const m of mats) { m.envMap = this.envs.get(z)!; m.needsUpdate = true }
      }
      if (this.sculpture) this.sculpture.setEnvMap(this.envs.get('atrium')!)
      for (const [, mesh] of this.screens) {
        const m = mesh.material as THREE.MeshStandardMaterial
        if (m.userData?.zone) { m.envMap = this.envs.get(m.userData.zone as Zone)!; m.needsUpdate = true }
      }
    }
    hiddenFx.forEach(o => (o.visible = true))
    rt.dispose()
    pmrem.dispose()
  }

  private setupComposer() {
    const low = this.o.lowQuality
    this.composer = new EffectComposer(this.renderer, { frameBufferType: THREE.HalfFloatType, multisampling: low ? 0 : 4 })
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    const bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 1.15, luminanceSmoothing: 0.2, intensity: low ? 0.45 : 0.6, radius: 0.72, levels: low ? 5 : 7 })
    this.vignette = new VignetteEffect({ offset: 0.32, darkness: 0.42 })
    const tone = this.toneFx = new ToneMappingEffect({ mode: ToneMappingMode.AGX })
    const noise = new NoiseEffect({ premultiply: true, blendFunction: BlendFunction.SCREEN })
    noise.blendMode.opacity.value = 0.035
    const effects: Effect[] = [this.exposureFx, bloom, this.vignette, tone, this.contrastFx, noise]
    if (low) effects.push(new SMAAEffect())
    this.composer.addPass(new EffectPass(this.camera, ...effects))
  }

  // --- interaction ------------------------------------------------------------
  private bindEvents() {
    const c = this.o.canvas
    c.addEventListener('pointermove', this.onPointerMove)
    c.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('pointerup', this.onPointerUp)
    c.addEventListener('pointerleave', this.onPointerLeave)
    window.addEventListener('resize', this.resize)
  }

  private onPointerMove = (e: PointerEvent) => {
    const r = this.o.canvas.getBoundingClientRect()
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1
    const ny = -((e.clientY - r.top) / r.height) * 2 + 1
    if (this.drag && this.drag.id === e.pointerId) {
      const dx = (e.clientX - this.drag.x) / r.width
      const dy = (e.clientY - this.drag.y) / r.height
      if (Math.abs(dx) + Math.abs(dy) > 0.006) this.drag.moved = true
      if (this.drag.moved && !this.panelOpen) this.rig.look(dx, dy)
      this.drag.x = e.clientX
      this.drag.y = e.clientY
    }
    if (e.pointerType === 'mouse') {
      this.pointerNdc.set(nx, ny)
      this.pointerDirty = true
      this.rig.pointer(-nx, -ny)
    }
  }

  private onPointerDown = (e: PointerEvent) => {
    this.drag = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId }
  }

  private onPointerUp = (e: PointerEvent) => {
    const d = this.drag
    this.drag = null
    if (!d || d.moved || d.id !== e.pointerId || e.target !== this.o.canvas) return
    const r = this.o.canvas.getBoundingClientRect()
    this.pointerNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    const hit = this.pick()
    if (hit) this.activate(hit.id)
    else if (this.sculptureHit()) { /* handled in sculptureHit */ }
  }

  private onPointerLeave = () => {
    this.pointerNdc.set(9, 9)
    this.pointerDirty = true
    this.rig.pointer(0, 0)
  }

  private activeFor(hitName: string) {
    const list = this.byHit.get(hitName)
    if (!list) return null
    return list.find(it => it.zone === this.zone) ?? null
  }

  private pick(): Interactable | null {
    if (this.pointerNdc.x > 2) return null
    this.raycaster.setFromCamera(this.pointerNdc, this.camera)
    const hits = this.raycaster.intersectObjects(this.colliders, false)
    for (const h of hits) {
      const n = h.object.name
      if (n.startsWith('hit_')) {
        const it = this.activeFor(n)
        if (it) return it
        continue // inactive hit volumes are transparent to picking
      }
      return null
    }
    return null
  }

  private sculptureHit() {
    if (this.zone !== 'atrium' || !this.sculpture) return false
    this.raycaster.setFromCamera(this.pointerNdc, this.camera)
    const h = this.hitMeshes.get('hit_hero')
    if (!h) return false
    const r = this.raycaster.intersectObject(h, false)[0]
    if (!r) return false
    this.sculpture.ripple(r.point.x, r.point.z)
    return true
  }

  activate(id: string) {
    const it = this.interactables.find(i => i.id === id)
    if (!it) return
    if (it.kind === 'feature' && it.hit === 'hit_hero') {
      const h = this.hitMeshes.get('hit_hero')
      if (h && this.sculpture) {
        const ang = Math.random() * Math.PI * 2
        this.sculpture.ripple(Math.cos(ang) * 1.2, Math.sin(ang) * 1.2)
      }
    }
    this.o.callbacks.onActivate?.(it)
  }

  /** Keyboard / marker hover parity with pointer hover. */
  setFocus(id: string | null) {
    this.keyFocused = id
  }

  setMarkers(map: Map<string, HTMLElement>) { this.markers = map }

  setReducedMotion(v: boolean) {
    this.rig.reducedMotion = v
    this.sculpture?.setStill(v)
  }

  /** Space reserved by UI (px) so framing keeps subjects clear of panels. */
  setInset(right: number, bottom: number, left = 0, guideBottom = 0) {
    const changed = left !== this.inset.left || guideBottom !== this.inset.guideBottom
    this.inset = { right, bottom, left, guideBottom }
    if (changed && this.rig && !this.focusId && !this.rig.moving) this.rig.goTo(this.stationPose(this.zone), [], true)
  }

  setPanelOpen(open: boolean) {
    this.panelOpen = open
    this.exposureTarget = open ? 0.82 : 1
  }

  // --- navigation -------------------------------------------------------------
  private stationPose(zone: Zone): Pose {
    const st = ZONE_STATIONS[zone]
    const tablet = this.portrait && this.size.x / this.size.y > 0.6
    const p = this.portrait ? (tablet && st.tablet ? st.tablet : st.portrait) : st.landscape
    // keep the room composed in the area the room guide leaves free (atrium is authored around the hero)
    const guide = !this.portrait && zone !== 'atrium' ? this.inset.left / this.size.x : 0
    // on phones the guide is a bottom sheet: lift the room into the space above it
    const sheet = this.portrait && zone !== 'atrium' ? this.inset.guideBottom / this.size.y : 0
    return { pos: p.pos.clone(), target: p.target.clone(), fov: p.fov, shiftX: p.shiftX - guide, shiftY: p.shiftY - sheet }
  }

  /** Framing for an exhibit: subject centred in the free area left of / above the panel. */
  private exhibitPose(it: Interactable): Pose | null {
    const authored = FOCUS_POSES[it.id]
    if (authored) {
      const p = this.portrait ? authored.portrait : authored.landscape
      const W = this.size.x
      const H = this.size.y
      return {
        pos: p.pos.clone(), target: p.target.clone(), fov: p.fov,
        shiftX: p.shiftX + this.inset.right / W,
        shiftY: p.shiftY - (this.inset.bottom - (this.portrait ? 64 : 0)) / H,
      }
    }
    let center: THREE.Vector3
    let normal: THREE.Vector3
    let width: number
    let height: number
    const scr = it.screen ? this.screens.get(it.screen) : null
    if (scr) {
      const g = this.screenGeom(scr)
      center = g.center; normal = g.normal; width = g.width; height = g.height
    } else {
      const h = this.hitMeshes.get(it.hit)
      if (!h) return null
      const bb = new THREE.Box3().setFromObject(h)
      center = bb.getCenter(new THREE.Vector3())
      const st = this.stationPose(it.zone)
      normal = st.pos.clone().sub(center).setY(0).normalize()
      const sz = bb.getSize(new THREE.Vector3())
      width = Math.max(sz.x, sz.z) * 0.9
      height = sz.y * 0.7
    }
    const W = this.size.x
    const H = this.size.y
    const freeW = Math.max(0.35, (W - this.inset.right) / W)
    const top = this.portrait ? 64 : 0
    const freeH = Math.max(0.3, (H - this.inset.bottom - top) / H)
    const fov = this.portrait ? 60 : 40
    const vfov = THREE.MathUtils.degToRad(fov)
    const aspect = W / H
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect)
    const small = width < 2.0
    const fillW = (this.portrait ? 0.86 : small ? 0.46 : 0.62) * freeW
    const fillH = (this.portrait ? 0.62 : small ? 0.5 : 0.6) * freeH
    const distW = width / (2 * Math.tan(hfov / 2) * fillW)
    const distH = height / (2 * Math.tan(vfov / 2) * fillH)
    const dist = Math.max(distW, distH, 1.6)
    const flat = normal.clone().setY(0)
    const dir = flat.lengthSq() > 0.01 ? flat.normalize().lerp(normal, 0.35).normalize() : normal.clone()
    // three-quarter view: swing round the exhibit so its depth and setting read
    const side = new THREE.Vector3().crossVectors(THREE.Object3D.DEFAULT_UP, flat.lengthSq() > 0.01 ? flat : dir).normalize()
    const swing = this.portrait ? 0.12 : 0.34
    dir.addScaledVector(side, swing).normalize()
    const pos = center.clone().addScaledVector(dir, dist * 1.05)
    pos.y = THREE.MathUtils.clamp(pos.y, 1.45, 2.3)
    const target = center.clone()
    // keep the line of sight level-ish so verticals stay calm; recover framing with lens shift
    const dy = target.y - pos.y
    target.y = pos.y + dy * 0.35
    const projShiftY = dy * 0.65 / (Math.tan(vfov / 2) * pos.distanceTo(center))
    return {
      pos, target, fov,
      shiftX: this.inset.right / W,
      // positive shiftY moves the image down; projShiftY < 0 lifts the exhibit back to the optical centre
      shiftY: -(this.inset.bottom - top) / H + projShiftY,
    }
  }

  async goZone(zone: Zone, instant = false) {
    const from = zoneAt(this.rig.pose.pos)
    this.focusId = null
    this.setZone(zone)
    this.o.callbacks.onMoving?.(true)
    await this.rig.goTo(this.stationPose(zone), route(from, zone), instant)
    this.o.callbacks.onMoving?.(false)
  }

  async focus(id: string, instant = false) {
    const it = this.interactables.find(i => i.id === id)
    if (!it) return
    const pose = this.exhibitPose(it)
    if (!pose) return
    const from = zoneAt(this.rig.pose.pos)
    this.focusId = id
    this.setZone(it.zone)
    this.o.callbacks.onMoving?.(true)
    await this.rig.goTo(pose, route(from, it.zone), instant)
    this.o.callbacks.onMoving?.(false)
  }

  async unfocus() {
    if (!this.focusId) return
    this.focusId = null
    await this.goZone(this.zone)
  }

  private setZone(z: Zone) {
    if (z === this.zone) return
    this.zone = z
    this.o.callbacks.onZone?.(z)
  }

  // --- frame loop ---------------------------------------------------------------
  private resize = () => {
    const c = this.o.canvas
    const w = c.clientWidth || window.innerWidth
    const h = c.clientHeight || window.innerHeight
    const wasPortrait = this.portrait
    this.size.set(w, h)
    this.renderer.setPixelRatio(this.dpr)
    this.renderer.setSize(w, h, false)
    this.composer?.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    if (wasPortrait !== this.portrait && !this.rig.moving) {
      if (this.focusId) this.focus(this.focusId, true)
      else this.rig.goTo(this.stationPose(this.zone), [], true)
    }
  }

  private loop = () => {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.loop)
    this.clock.update()
    const dt = Math.min(0.05, this.clock.getDelta())
    this.time += dt
    this.rig.update(dt)
    this.sculpture?.update(dt)
    this.sky.update(this.time)
    this.shaft.update(this.time)

    this.exposure += (this.exposureTarget - this.exposure) * (1 - Math.exp(-dt * 2.5))
    this.exposureFx.exposure = this.exposureBase * this.exposure

    // hover (pointer) — skip while travelling
    if (this.pointerDirty && !this.rig.moving) {
      this.pointerDirty = false
      const it = this.pick()
      const id = it?.id ?? null
      if (id !== this.hovered) {
        this.hovered = id
        this.o.canvas.style.cursor = id ? 'pointer' : ''
        this.o.callbacks.onHover?.(id)
      }
    }
    this.updateHighlights(dt)
    this.updateMarkers()
    this.composer.render(dt)
    this.trackPerf(dt)
  }

  private updateHighlights(dt: number) {
    const active = this.hovered ?? this.keyFocused
    const activeIt = active ? this.interactables.find(i => i.id === active) : null
    for (const [name, frame] of this.highlights) {
      const on = !!activeIt && activeIt.screen === name
      const mat = frame.userData.mat as THREE.MeshBasicMaterial
      const target = on ? 1 : 0
      mat.opacity += (target - mat.opacity) * (1 - Math.exp(-dt * 14))
      frame.visible = mat.opacity > 0.01
      // the display itself lifts slightly while hovered (material response, not just an outline)
      const scr = this.screens.get(name)?.material as THREE.MeshStandardMaterial | undefined
      if (scr) {
        scr.userData.base ??= scr.emissiveIntensity
        scr.emissiveIntensity = scr.userData.base * (1 + 0.18 * mat.opacity)
      }
    }
  }

  private v = new THREE.Vector3()
  private updateMarkers() {
    if (!this.markers.size) return
    const W = this.size.x
    const H = this.size.y
    const moving = this.rig.moving
    for (const [id, el] of this.markers) {
      const it = this.interactables.find(i => i.id === id)
      const h = it && this.hitMeshes.get(it.hit)
      if (!it || !h || it.zone !== this.zone || moving || this.panelOpen) {
        if (el.dataset.vis !== '0') { el.dataset.vis = '0'; el.style.opacity = '0'; el.style.pointerEvents = 'none'; el.tabIndex = -1; el.setAttribute('aria-hidden', 'true') }
        continue
      }
      const key = `anchor:${id}`
      if (!h.userData[key]) {
        const bb = new THREE.Box3().setFromObject(h)
        const c = bb.getCenter(new THREE.Vector3())
        const scr = it.screen ? this.screens.get(it.screen) : null
        if (scr) {
          // pin sits just above the display it belongs to
          const g = this.screenGeom(scr)
          c.copy(g.center).addScaledVector(g.up, g.height / 2 + 0.32).addScaledVector(g.normal, 0.05)
        } else if (it.kind === 'destination') c.y = Math.min(bb.max.y - 0.6, 3.2)
        else c.y = Math.min(bb.max.y - 0.05, 1.6)
        h.userData[key] = c
      }
      const anchor = h.userData[key] as THREE.Vector3
      const far = anchor.distanceTo(this.camera.position) > (it.kind === 'destination' ? 30 : 15)
      this.v.copy(anchor).project(this.camera)
      const behind = this.v.z > 1
      const x = (this.v.x * 0.5 + 0.5) * W
      const y = (-this.v.y * 0.5 + 0.5) * H
      const clearOfGuide = !(x < this.inset.left + 16 && y > H * 0.12)
      const onScreen = !behind && !far && clearOfGuide && x > 24 && x < W - 24 && y > 72 && y < H - 24
      if (!onScreen) {
        if (el.dataset.vis !== '0') { el.dataset.vis = '0'; el.style.opacity = '0'; el.style.pointerEvents = 'none'; el.tabIndex = -1; el.setAttribute('aria-hidden', 'true') }
        continue
      }
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      const flip = x > W - 280 ? '1' : '0'
      if (el.dataset.flip !== flip) el.dataset.flip = flip
      if (el.dataset.vis !== '1') { el.dataset.vis = '1'; el.style.opacity = '1'; el.style.pointerEvents = 'auto'; el.tabIndex = 0; el.removeAttribute('aria-hidden') }
      el.dataset.hover = (this.hovered === id || this.keyFocused === id) ? '1' : '0'
    }
  }

  private trackPerf(dt: number) {
    this.frameTimes.push(dt)
    if (this.frameTimes.length < 90) return
    const avg = this.frameTimes.reduce((a, c) => a + c, 0) / this.frameTimes.length
    this.frameTimes.length = 0
    const fps = 1 / avg
    this.o.callbacks.onPerf?.({ dpr: this.dpr, fps })
    if (fps < 42 && this.dpr > 1) {
      this.dpr = Math.max(1, this.dpr - 0.25)
      this.resize()
    } else if (fps > 58 && this.dpr < Math.min(window.devicePixelRatio || 1, this.dprCap)) {
      this.dpr = Math.min(this.dprCap, this.dpr + 0.125)
      this.resize()
    }
  }

  private exposureBase = 1.2
  /** live calibration hook used during visual review */
  tune(o: { snap?: boolean, contrast?: number, tone?: 'agx' | 'neutral' | 'aces', exposure?: number, lm?: number, fog?: number, bloom?: number, color?: Record<string, string>, env?: Record<string, number> }) {
    if (o.exposure !== undefined) this.exposureBase = o.exposure
    if (o.snap) this.exposure = this.exposureTarget
    if (o.contrast !== undefined) this.contrastFx.contrast = o.contrast
    if (o.tone) this.toneFx.mode = { agx: ToneMappingMode.AGX, neutral: ToneMappingMode.NEUTRAL, aces: ToneMappingMode.ACES_FILMIC }[o.tone]
    if (o.fog !== undefined) (this.scene.fog as THREE.FogExp2).density = o.fog
    for (const [, mats] of this.zoneMaterials) {
      for (const m of mats) {
        if (o.lm !== undefined && m.lightMap) m.lightMapIntensity = o.lm * Math.PI
        if (o.color?.[m.name]) m.color.set(o.color[m.name])
        if (o.env?.[m.name] !== undefined) m.envMapIntensity = o.env[m.name]
      }
    }
    if (o.bloom !== undefined) this.shaft.setStrength(o.bloom)
    return { exposure: this.exposureBase }
  }

  /** Render one frame and return it as an image (used for the poster and review snapshots). */
  capture(type = 'image/webp', quality = 0.9, width = 0) {
    this.exposureFx.exposure = this.exposureBase * this.exposure
    this.sculpture?.update(0)
    this.composer.render(0)
    const src = this.o.canvas
    if (!width) return src.toDataURL(type, quality)
    const c = document.createElement('canvas')
    c.width = width
    c.height = Math.round(width * src.height / src.width)
    const ctx = c.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(src, 0, 0, c.width, c.height)
    return c.toDataURL(type, quality)
  }

  /** for automated visual review */
  debugPose() {
    const p = this.rig.pose
    return { pos: p.pos.toArray(), target: p.target.toArray(), fov: p.fov, shiftX: p.shiftX, shiftY: p.shiftY, dpr: this.dpr }
  }

  setPose(p: { pos: number[], target: number[], fov?: number, shiftX?: number, shiftY?: number }) {
    this.rig.goTo({
      pos: new THREE.Vector3().fromArray(p.pos), target: new THREE.Vector3().fromArray(p.target),
      fov: p.fov ?? this.rig.pose.fov, shiftX: p.shiftX ?? 0, shiftY: p.shiftY ?? 0,
    }, [], true)
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    const c = this.o.canvas
    c.removeEventListener('pointermove', this.onPointerMove)
    c.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('pointerup', this.onPointerUp)
    c.removeEventListener('pointerleave', this.onPointerLeave)
    window.removeEventListener('resize', this.resize)
    this.sculpture?.dispose()
    this.composer?.dispose()
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.geometry?.dispose()
        const mats = Array.isArray(m.material) ? m.material : [m.material]
        for (const mt of mats) {
          for (const v of Object.values(mt)) if (v && (v as THREE.Texture).isTexture) (v as THREE.Texture).dispose()
          mt.dispose()
        }
      }
    })
    this.envs.forEach(e => e.dispose())
    this.renderer.dispose()
  }
}
