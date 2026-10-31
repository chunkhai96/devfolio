import * as THREE from 'three'
import type { Pose } from './stations'

/** Perspective camera with architectural lens shift (keeps verticals parallel). */
export class ShiftCamera extends THREE.PerspectiveCamera {
  shiftX = 0
  shiftY = 0
  override updateProjectionMatrix() {
    super.updateProjectionMatrix()
    if (this.shiftX || this.shiftY) {
      const e = this.projectionMatrix.elements
      e[8] += this.shiftX
      e[9] += this.shiftY
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert()
    }
  }
}

// settle-heavy ease: quick departure, long soft arrival, no overshoot
const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

interface Travel {
  curve: THREE.CatmullRomCurve3
  fromTarget: THREE.Vector3
  toTarget: THREE.Vector3
  from: Pose
  to: Pose
  t: number
  duration: number
  routed: boolean
  resolve: () => void
}

export class CameraRig {
  readonly pose: Pose
  private travel: Travel | null = null
  private yaw = 0
  private pitch = 0
  private yawT = 0
  private pitchT = 0
  private par = new THREE.Vector2()
  private parT = new THREE.Vector2()
  reducedMotion = false
  /** extra offset (e.g. panel open) blended into the lens shift */
  shiftBias = new THREE.Vector2()
  private shiftBiasCur = new THREE.Vector2()

  constructor(public camera: ShiftCamera, start: Pose) {
    this.pose = { pos: start.pos.clone(), target: start.target.clone(), fov: start.fov, shiftX: start.shiftX, shiftY: start.shiftY }
    this.apply()
  }

  get moving() { return !!this.travel }

  goTo(to: Pose, via: THREE.Vector3[] = [], instant = false): Promise<void> {
    if (this.travel) this.travel.resolve()
    this.yawT = 0
    this.pitchT = 0
    if (instant || this.reducedMotion) {
      this.copyPose(to)
      this.travel = null
      this.yaw = this.pitch = 0
      this.apply()
      return Promise.resolve()
    }
    const pts = [this.pose.pos.clone(), ...via.map(v => v.clone()), to.pos.clone()]
    if (pts.length === 2) {
      // add a gentle mid-point lift so short moves still read as deliberate
      const mid = pts[0].clone().lerp(pts[1], 0.5)
      mid.y += Math.min(0.25, pts[0].distanceTo(pts[1]) * 0.03)
      pts.splice(1, 0, mid)
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5)
    const len = curve.getLength()
    const duration = Math.min(3.2, Math.max(0.9, 0.75 + len * 0.055))
    return new Promise((resolve) => {
      this.travel = {
        curve, from: this.clonePose(this.pose), to: this.clonePose(to),
        fromTarget: this.pose.target.clone(), toTarget: to.target.clone(),
        t: 0, duration, routed: via.length > 0, resolve,
      }
    })
  }

  /** drag-look in normalised units (fraction of viewport) */
  look(dx: number, dy: number) {
    this.yawT = THREE.MathUtils.clamp(this.yawT - dx * 1.4, -0.42, 0.42)
    this.pitchT = THREE.MathUtils.clamp(this.pitchT - dy * 0.8, -0.16, 0.2)
  }

  pointer(nx: number, ny: number) { this.parT.set(nx, ny) }

  update(dt: number) {
    const tr = this.travel
    if (tr) {
      tr.t = Math.min(1, tr.t + dt / tr.duration)
      const e = ease(tr.t)
      tr.curve.getPointAt(e, this.pose.pos)
      // look target: blend from->to; when routed through doorways, look along the path mid-way
      const tgt = tr.fromTarget.clone().lerp(tr.toTarget, smootherstep(Math.min(1, Math.max(0, (e - 0.15) / 0.7))))
      if (tr.routed) {
        const ahead = tr.curve.getPointAt(Math.min(1, e + 0.12))
        ahead.y = this.pose.pos.y
        const dir = ahead.sub(this.pose.pos)
        if (dir.lengthSq() > 1e-6) {
          const lookAhead = this.pose.pos.clone().add(dir.normalize().multiplyScalar(6))
          const w = Math.sin(Math.PI * e) ** 2 * 0.85
          tgt.lerp(lookAhead, w)
        }
      }
      this.pose.target.copy(tgt)
      this.pose.fov = THREE.MathUtils.lerp(tr.from.fov, tr.to.fov, e)
      this.pose.shiftX = THREE.MathUtils.lerp(tr.from.shiftX, tr.to.shiftX, e)
      this.pose.shiftY = THREE.MathUtils.lerp(tr.from.shiftY, tr.to.shiftY, e)
      if (tr.t >= 1) {
        this.copyPose(tr.to)
        this.travel = null
        tr.resolve()
      }
    }
    const k = 1 - Math.exp(-dt * (this.reducedMotion ? 30 : 3.2))
    this.yaw += (this.yawT - this.yaw) * k
    this.pitch += (this.pitchT - this.pitch) * k
    if (!this.reducedMotion) this.par.lerp(this.parT, 1 - Math.exp(-dt * 2.2))
    else this.par.set(0, 0)
    this.shiftBiasCur.lerp(this.shiftBias, 1 - Math.exp(-dt * (this.reducedMotion ? 30 : 4.5)))
    this.apply()
  }

  private apply() {
    const cam = this.camera
    const p = this.pose
    const fwd = p.target.clone().sub(p.pos)
    const dist = fwd.length()
    fwd.normalize()
    const right = new THREE.Vector3().crossVectors(fwd, THREE.Object3D.DEFAULT_UP).normalize()
    // parallax: small physical camera offset, opposite to the pointer
    const pos = p.pos.clone()
      .addScaledVector(right, this.par.x * 0.09)
      .addScaledVector(THREE.Object3D.DEFAULT_UP, this.par.y * 0.05)
    // drag-look rotates the aim around the camera, not the camera around the target
    const q = new THREE.Quaternion().setFromAxisAngle(THREE.Object3D.DEFAULT_UP, this.yaw)
    const dir = fwd.clone().applyQuaternion(q)
    const r2 = new THREE.Vector3().crossVectors(dir, THREE.Object3D.DEFAULT_UP).normalize()
    dir.applyAxisAngle(r2, this.pitch)
    cam.position.copy(pos)
    cam.lookAt(pos.clone().addScaledVector(dir, dist))
    cam.fov = p.fov
    cam.shiftX = p.shiftX + this.shiftBiasCur.x
    cam.shiftY = p.shiftY + this.shiftBiasCur.y
    cam.updateProjectionMatrix()
  }

  private clonePose(p: Pose): Pose {
    return { pos: p.pos.clone(), target: p.target.clone(), fov: p.fov, shiftX: p.shiftX, shiftY: p.shiftY }
  }

  private copyPose(p: Pose) {
    this.pose.pos.copy(p.pos)
    this.pose.target.copy(p.target)
    this.pose.fov = p.fov
    this.pose.shiftX = p.shiftX
    this.pose.shiftY = p.shiftY
  }
}
