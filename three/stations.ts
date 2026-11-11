import { Vector3 } from 'three'

/** Blender (X east, Y north, Z up) -> three (X, Y up, -Z north). */
export const b = (x: number, y: number, z: number) => new Vector3(x, z, -y)

import { type Zone, ZONES, ZONE_META } from './meta'

export { type Zone, ZONES, ZONE_META }

export interface Pose {
  pos: Vector3
  target: Vector3
  fov: number
  /** Architectural lens shift (fraction of half-frame); keeps verticals straight. */
  shiftX: number
  shiftY: number
}

export interface Station {
  id: string
  zone: Zone
  landscape: Pose
  portrait: Pose
  /** optional recomposition for wide portrait screens (tablets) */
  tablet?: Pose
}

const pose = (pos: Vector3, target: Vector3, fov: number, shiftX = 0, shiftY = 0): Pose =>
  ({ pos, target, fov, shiftX, shiftY })

/** Overview station per zone. Portrait variants are recomposed, not cropped. */
export const ZONE_STATIONS: Record<Zone, Station> = {
  atrium: {
    id: 'atrium', zone: 'atrium',
    landscape: pose(b(-6.2, -8.6, 2.15), b(1.6, 3.2, 2.15), 52, -0.2, 0.48),
    portrait: pose(b(-0.6, -8.6, 1.7), b(0.3, 4.0, 1.7), 64, 0.0, 0.36),
    // tablets: wider lens, less rise, so the lit corridor doorway (a destination) sits above the copy
    tablet: pose(b(-0.6, -8.8, 1.7), b(0.3, 4.0, 1.7), 74, 0.0, 0.15),
  },
  gallery: {
    id: 'gallery', zone: 'gallery',
    landscape: pose(b(11.4, -2.8, 1.65), b(28.0, 1.6, 1.65), 52, 0.0, 0.12),
    portrait: pose(b(11.2, 0, 1.65), b(34.0, 0, 1.65), 70, 0.0, 0.12),
  },
  lab: {
    id: 'lab', zone: 'lab',
    landscape: pose(b(-11.6, -6.8, 1.9), b(-20.5, 3.6, 1.75), 57, -0.13, 0.12),
    portrait: pose(b(-10.4, -3.8, 1.75), b(-21.0, 1.4, 1.75), 68, 0.0, 0.12),
  },
  corridor: {
    id: 'corridor', zone: 'corridor',
    landscape: pose(b(2.8, 13.4, 1.75), b(-3.0, 24.6, 1.8), 58, -0.1, 0.04),
    portrait: pose(b(0.4, 10.6, 1.7), b(-0.2, 26.0, 1.7), 68, 0.0, 0.12),
  },
  terrace: {
    id: 'terrace', zone: 'terrace',
    // three-quarter view from under the canopy: soffit overhead, lounge and plinth in the middle ground, portal and sea beyond
    landscape: pose(b(5.4, 34.9, 1.65), b(-1.6, 43.0, 1.8), 56, -0.1, 0.1),
    portrait: pose(b(0.0, 35.2, 1.6), b(0.0, 46.0, 1.9), 70, 0.0, 0.14),
  },
}

/** Hand-composed close-ups for exhibits that are objects rather than screens. */
export const FOCUS_POSES: Record<string, { landscape: Pose, portrait: Pose }> = {
  contact: {
    landscape: pose(b(-2.4, 37.0, 1.7), b(0.2, 42.0, 1.4), 46, 0.0, 0.06),
    portrait: pose(b(-1.5, 35.2, 2.9), b(0.2, 41.0, 0.85), 60, 0.0, -0.04),
  },
}

/** Doorway waypoints used to route camera travel through real openings. */
const PORTAL = {
  gallery: b(9.33, 0, 1.8),
  lab: b(-9.33, 0, 1.8),
  corridor: b(0, 9.33, 1.8),
}

export function routeOut(zone: Zone): Vector3[] {
  switch (zone) {
    case 'gallery': return [PORTAL.gallery]
    case 'lab': return [PORTAL.lab]
    case 'corridor': return [PORTAL.corridor]
    case 'terrace': return [b(0, 34.0, 1.8), b(0, 22, 1.8), PORTAL.corridor]
    default: return []
  }
}

export function route(from: Zone, to: Zone): Vector3[] {
  if (from === to) return []
  if ((from === 'terrace' && to === 'corridor') || (from === 'corridor' && to === 'terrace')) return [b(0, 34.0, 1.8)]
  if (from === 'corridor' && to !== 'atrium') return [...routeOut('corridor'), ...routeOut(to).slice().reverse()]
  const out = routeOut(from)
  const inn = routeOut(to).slice().reverse()
  return [...out, ...inn]
}

/** Reflection probe positions per zone. */
export const PROBES: Record<Zone, Vector3> = {
  atrium: b(0, -3.0, 1.8),
  gallery: b(22, 0, 1.8),
  lab: b(-18, 0, 1.8),
  corridor: b(0, 22, 1.8),
  terrace: b(0, 40, 1.8),
}

/** Approximate zone bounds (three coords) for box-projected reflections and zone lookup. */
export const BOUNDS: Record<Zone, [Vector3, Vector3]> = {
  atrium: [new Vector3(-9, 0, -9), new Vector3(9, 10, 9)],
  gallery: [new Vector3(9.6, 0, -6), new Vector3(34, 7.6, 6)],
  lab: [new Vector3(-26, 0, -7), new Vector3(-9.6, 7.6, 7)],
  corridor: [new Vector3(-3.5, 0, -34), new Vector3(3.5, 7.6, -9.6)],
  terrace: [new Vector3(-12, 0, -47), new Vector3(12, 30, -34)],
}

export function zoneAt(p: Vector3): Zone {
  for (const z of ZONES) {
    const [mn, mx] = BOUNDS[z]
    if (p.x >= mn.x - 0.4 && p.x <= mx.x + 0.4 && p.z >= mn.z - 0.4 && p.z <= mx.z + 0.4) return z
  }
  return 'atrium'
}
