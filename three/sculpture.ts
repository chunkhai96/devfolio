import * as THREE from 'three'

/**
 * "Kinetic Field" — suspended titanium droplets on fine cables whose heights trace a
 * slowly re-fitting surface (a quiet nod to learned functions). Hex layout matches the
 * Blender proxy used for the baked contact shadow.
 */
export class Sculpture {
  readonly group = new THREE.Group()
  private mesh: THREE.InstancedMesh
  private cables: THREE.LineSegments
  private pts: { x: number, z: number, r: number, phase: number }[] = []
  private dummy = new THREE.Object3D()
  private ripples: { x: number, z: number, t0: number }[] = []
  private time = 0
  private heights: Float32Array
  private still = false

  constructor(envMap: THREE.Texture | null, private lowQuality: boolean) {
    const spacing = lowQuality ? 0.26 : 0.2
    const radius = 2.6
    const n = Math.ceil(radius / spacing) + 1
    for (let j = -n; j <= n; j++) {
      for (let i = -n; i <= n; i++) {
        const x = i * spacing + (j & 1 ? spacing / 2 : 0)
        const z = j * spacing * 0.866
        const r = Math.hypot(x, z)
        if (r <= radius) this.pts.push({ x, z, r, phase: Math.sin(i * 12.9898 + j * 78.233) * 0.5 + 0.5 })
      }
    }
    this.heights = new Float32Array(this.pts.length)

    // droplet: lathe profile, pointed tip at the bottom, cable eye at the top
    const prof: THREE.Vector2[] = []
    const H = 0.15
    const rings = lowQuality ? 9 : 18
    for (let k = 0; k <= rings; k++) {
      const t = k / rings
      const y = -H / 2 + t * H
      const rr = 0.034 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 1.1) * (1 - 0.25 * t)
      prof.push(new THREE.Vector2(Math.max(rr, 0.0005), y))
    }
    const geo = new THREE.LatheGeometry(prof, lowQuality ? 8 : 16)
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d4d8da'), metalness: 1, roughness: 0.16, envMap, envMapIntensity: 1.25,
    })
    this.mesh = new THREE.InstancedMesh(geo, mat, this.pts.length)
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.group.add(this.mesh)

    const cablePos = new Float32Array(this.pts.length * 6)
    const cg = new THREE.BufferGeometry()
    cg.setAttribute('position', new THREE.BufferAttribute(cablePos, 3).setUsage(THREE.DynamicDrawUsage))
    const cm = new THREE.LineBasicMaterial({ color: new THREE.Color('#9aa3a8'), transparent: true, opacity: lowQuality ? 0.1 : 0.16, depthWrite: false })
    this.cables = new THREE.LineSegments(cg, cm)
    this.group.add(this.cables)
    // the titanium ring hangs on four fine cables into the light well
    const ringPts: number[] = []
    for (let a = 0; a < 4; a++) {
      const ang = a * Math.PI / 2 + Math.PI / 4
      const x = 3.0 * Math.cos(ang)
      const z = 3.0 * Math.sin(ang)
      ringPts.push(x, 9.25, z, x * 0.98, 11.9, z * 0.98)
    }
    const rg = new THREE.BufferGeometry()
    rg.setAttribute('position', new THREE.Float32BufferAttribute(ringPts, 3))
    this.group.add(new THREE.LineSegments(rg, cm))
    this.update(0)
    // static bounds with headroom for the wave, so rooms that can't see the sculpture skip it
    const bounds = new THREE.Sphere(new THREE.Vector3(0, 8.5, 0), 4.6)
    this.mesh.boundingSphere = bounds.clone()
    this.cables.geometry.boundingSphere = bounds.clone()
  }

  setEnvMap(env: THREE.Texture) {
    const m = this.mesh.material as THREE.MeshStandardMaterial
    m.envMap = env
    m.needsUpdate = true
  }

  setStill(still: boolean) { this.still = still }

  ripple(worldX: number, worldZ: number) {
    this.ripples.push({ x: worldX, z: worldZ, t0: this.time })
    if (this.ripples.length > 4) this.ripples.shift()
  }

  private surface(x: number, z: number, r: number, t: number) {
    // two slow fields cross-fading over ~40 s; amplitudes kept architectural, not wobbly
    const w = 0.5 + 0.5 * Math.sin(t * 0.05)
    const a = 0.34 * Math.sin(0.95 * x + 0.32 * t) * Math.cos(0.8 * z - 0.21 * t)
    const c = 0.30 * Math.cos(1.25 * r - 0.42 * t) * (1 - r / 3.4)
    const d = 0.18 * Math.sin(0.7 * (x + z) + 0.27 * t)
    return 6.0 + 0.35 * Math.cos(r * 1.15) + (1 - w) * a + w * c + d * 0.6
  }

  update(dt: number) {
    if (!this.still) this.time += dt
    const t = this.time
    const pos = (this.cables.geometry.getAttribute('position') as THREE.BufferAttribute)
    const arr = pos.array as Float32Array
    for (let i = 0; i < this.pts.length; i++) {
      const p = this.pts[i]
      let y = this.surface(p.x, p.z, p.r, t)
      for (const rp of this.ripples) {
        const age = t - rp.t0
        if (age > 9) continue
        const d = Math.hypot(p.x - rp.x, p.z - rp.z)
        const front = age * 0.9
        y += 0.22 * Math.exp(-((d - front) ** 2) / 0.18) * Math.exp(-age * 0.35) * Math.sin((d - front) * 5.0)
      }
      // soft smoothing so ripples feel heavy
      const prev = this.heights[i] || y
      y = dt > 0 ? prev + (y - prev) * Math.min(1, dt * 6) : y
      this.heights[i] = y
      this.dummy.position.set(p.x, y, p.z)
      this.dummy.rotation.set(0, p.phase * 6.28 + t * 0.05, 0)
      this.dummy.updateMatrix()
      this.mesh.setMatrixAt(i, this.dummy.matrix)
      const o = i * 6
      arr[o] = p.x; arr[o + 1] = 11.9; arr[o + 2] = p.z
      arr[o + 3] = p.x; arr[o + 4] = y + 0.075; arr[o + 5] = p.z
    }
    this.mesh.instanceMatrix.needsUpdate = true
    pos.needsUpdate = true
  }

  dispose() {
    this.mesh.geometry.dispose()
    ;(this.mesh.material as THREE.Material).dispose()
    this.cables.geometry.dispose()
    ;(this.cables.material as THREE.Material).dispose()
  }
}
