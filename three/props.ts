import * as THREE from 'three'
import type { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { b, type Zone } from './stations'

/**
 * Scanned CC0 furniture from Poly Haven (polyhaven.com), placed into the baked rooms.
 * Their contact shadows come from proxies in the Blender bake (blender/world.py).
 */
interface Placement { file: string, zone: Zone, at: [number, number, number], yaw: number }

/** Bring scanned finishes into the palette (DESIGN §2.1: no new saturated accents). */
const TINT: Record<string, [number, number, number]> = {
  mid_century_lounge_chair: [0.62, 0.6, 0.6],    // red leather -> desaturated graphite-cognac
  metal_stool_01: [0.78, 0.8, 0.84],              // copper -> brushed steel
  modern_coffee_table_01: [0.7, 0.68, 0.66],
}
/** Saturation kept from the scanned albedo (1 = untouched). */
const SAT: Record<string, number> = { mid_century_lounge_chair: 0.28, metal_stool_01: 0.12 }

function desaturate(m: THREE.MeshStandardMaterial, sat: number) {
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>',
      `#include <map_fragment>\n  diffuseColor.rgb = mix( vec3( dot( diffuseColor.rgb, vec3( 0.299, 0.587, 0.114 ) ) ), diffuseColor.rgb, ${sat.toFixed(2)} );`)
  }
  m.customProgramCacheKey = () => `desat${sat}`
  m.needsUpdate = true
}

const PLACEMENTS: Placement[] = [
  // lab: bar stools along the worktable (Blender x, y, z; yaw in degrees about up)
  ...[-20.6, -17.8, -15.0].flatMap(x => [
    { file: 'metal_stool_01', zone: 'lab' as Zone, at: [x, -1.25, 0] as [number, number, number], yaw: 8 },
    { file: 'metal_stool_01', zone: 'lab' as Zone, at: [x, 1.25, 0] as [number, number, number], yaw: -12 },
  ]),
  // terrace: a lounge facing the horizon
  { file: 'mid_century_lounge_chair', zone: 'terrace', at: [-7.1, 40.5, 0], yaw: 180 + 14 },
  { file: 'mid_century_lounge_chair', zone: 'terrace', at: [-4.5, 40.5, 0], yaw: 180 - 14 },
  { file: 'modern_coffee_table_01', zone: 'terrace', at: [-5.8, 41.7, 0], yaw: 90 },
]

export async function loadProps(loader: GLTFLoader, base: string, scene: THREE.Scene, envFor: (z: Zone) => THREE.Texture | undefined) {
  const files = [...new Set(PLACEMENTS.map(p => p.file))]
  const sources = new Map<string, THREE.Object3D>()
  await Promise.all(files.map(async (f) => {
    const g = await loader.loadAsync(`${base}/atelier/props/${f}.glb`)
    sources.set(f, g.scene)
  }))
  const placed: { obj: THREE.Object3D, zone: Zone }[] = []
  for (const p of PLACEMENTS) {
    const obj = sources.get(p.file)!.clone(true)
    const tint = TINT[p.file]
    if (tint) obj.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
      if (m?.color && !m.userData.tinted) {
        m.color.multiply(new THREE.Color(...tint))
        if (SAT[p.file] !== undefined) desaturate(m, SAT[p.file])
        m.userData.tinted = true
      }
    })
    obj.position.copy(b(...p.at))
    obj.rotation.y = THREE.MathUtils.degToRad(p.yaw)
    scene.add(obj)
    placed.push({ obj, zone: p.zone })
  }
  const applyEnv = () => {
    for (const { obj, zone } of placed) {
      const env = envFor(zone)
      obj.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
        if (m && 'envMap' in m) { m.envMap = env ?? null; m.envMapIntensity = 1.35; m.needsUpdate = true }
      })
    }
  }
  return { applyEnv }
}
