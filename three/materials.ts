import * as THREE from 'three'

/** Must match blender/encode.py */
export const LM_K = 1.0

export type TexSet = 'basalt_floor' | 'limestone' | 'basalt' | 'ceramic' | 'plaster' | 'brushed' | 'fabric'

interface Spec {
  color: THREE.ColorRepresentation
  roughness: number
  metalness?: number
  tex?: TexSet
  /** metres covered by one texture tile */
  tile?: number
  normalScale?: number
  envIntensity?: number
  lightmapped: boolean
  vertexTone?: boolean
  physical?: boolean
  anisotropy?: number
}

/** Palette-anchored surface definitions (see DESIGN.md §2). */
export const SPECS: Record<string, Spec> = {
  basalt_floor: { color: '#6b7179', roughness: 0.46, tex: 'basalt_floor', tile: 4.6, normalScale: 0.35, envIntensity: 1.8, lightmapped: true },
  stone_wall: { color: '#8693a3', roughness: 1, tex: 'limestone', tile: 2.6, normalScale: 0.9, envIntensity: 0.12, lightmapped: true, vertexTone: true },
  plaster: { color: '#58616b', roughness: 1, tex: 'plaster', tile: 2.4, normalScale: 0.25, envIntensity: 0.2, lightmapped: true },
  ceramic: { color: '#f0ebe2', roughness: 1, tex: 'ceramic', tile: 1.2, normalScale: 0.35, envIntensity: 0.6, lightmapped: true },
  fabric: { color: '#5d6570', roughness: 1, tex: 'fabric', tile: 0.4, normalScale: 0.9, envIntensity: 0.0, lightmapped: true },
  basalt: { color: '#4d5258', roughness: 0.42, tex: 'basalt', tile: 1.4, normalScale: 0.3, envIntensity: 1.4, lightmapped: true },
  black: { color: '#0b0d10', roughness: 0.9, lightmapped: true, envIntensity: 0.1 },
  titanium: { color: '#c3c9cc', roughness: 0.9, metalness: 1, tex: 'brushed', tile: 0.35, normalScale: 0.6, envIntensity: 1.15, lightmapped: false, physical: true, anisotropy: 0.85 },
  titanium_dark: { color: '#3d434a', roughness: 0.55, metalness: 1, envIntensity: 1.0, lightmapped: false },
}

const LM_CHUNK = /* glsl */`
float lmLum = 1.0;
#if defined( RE_IndirectDiffuse )
  #ifdef USE_LIGHTMAP
    vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
    vec3 lmE = lightMapTexel.rgb * lightMapTexel.rgb;
    vec3 lmL = lmE / max( vec3( 1.0 ) - lmE, vec3( 1.0 / 255.0 ) ) * ${LM_K.toFixed(4)};
    irradiance += lmL * lightMapIntensity + lmFill;
    lmLum = dot( lmL, vec3( 0.2126, 0.7152, 0.0722 ) );
  #elif defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
    iblIrradiance += getIBLIrradiance( geometryNormal );
  #endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
  vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
  #ifdef USE_LIGHTMAP
    // specular occlusion: reflections only where the bake says light reaches
    iblRadiance *= clamp( pow( lmLum * lmSpecOcclusion, 0.7 ), 0.0, 1.0 );
  #endif
  radiance += iblRadiance;
#endif
`

/** Baked surfaces ignore realtime lights (those exist only to give metals their sparkle). */
const NO_DIRECT_BEGIN = THREE.ShaderChunk.lights_fragment_begin
  .replace(/NUM_(POINT|SPOT|DIR|RECT_AREA|HEMI)_LIGHTS\b/g, '0')

/** Box-projected (parallax-corrected) cubemap lookup for room-scale reflections. */
const BOX_PARS = /* glsl */`
uniform vec3 envBoxMin;
uniform vec3 envBoxMax;
uniform vec3 envProbePos;
varying vec3 vWorldPos;
vec3 boxProject( vec3 dir ) {
  vec3 rbmax = ( envBoxMax - vWorldPos ) / dir;
  vec3 rbmin = ( envBoxMin - vWorldPos ) / dir;
  vec3 rbminmax = max( rbmax, rbmin );
  float fa = min( min( rbminmax.x, rbminmax.y ), rbminmax.z );
  vec3 hit = vWorldPos + dir * fa;
  return normalize( hit - envProbePos );
}
`

export interface LightmapUniforms {
  lmSpecOcclusion: { value: number }
  lmFill: { value: THREE.Vector3 }
  envBoxMin: { value: THREE.Vector3 }
  envBoxMax: { value: THREE.Vector3 }
  envProbePos: { value: THREE.Vector3 }
}

/**
 * Patch a standard material: decode our lightmap encoding, drop IBL diffuse when baked,
 * apply specular occlusion, and optionally box-project the environment lookup.
 */
export function patchMaterial(mat: THREE.MeshStandardMaterial, box: { min: THREE.Vector3, max: THREE.Vector3, probe: THREE.Vector3 } | null, occlusion = 1.6, fill: [number, number, number] = [0, 0, 0]) {
  const uniforms: LightmapUniforms = {
    lmSpecOcclusion: { value: occlusion },
    lmFill: { value: new THREE.Vector3(...fill) },
    envBoxMin: { value: box ? box.min.clone() : new THREE.Vector3() },
    envBoxMax: { value: box ? box.max.clone() : new THREE.Vector3() },
    envProbePos: { value: box ? box.probe.clone() : new THREE.Vector3() },
  }
  const useBox = !!box
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms)
    if (useBox) {
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWorldPos;')
        .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWorldPos = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;')
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\n' + BOX_PARS)
        .replace('#include <envmap_physical_pars_fragment>', THREE.ShaderChunk.envmap_physical_pars_fragment
          .replace('reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );',
            'reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );\n\t\treflectVec = boxProject( reflectVec );'))
    }
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float lmSpecOcclusion;\nuniform vec3 lmFill;')
      .replace('#include <lights_fragment_begin>', NO_DIRECT_BEGIN)
      .replace('#include <lights_fragment_maps>', LM_CHUNK)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n#ifdef USE_COLOR\n  roughnessFactor = clamp( roughnessFactor * mix( 1.25, 0.72, vColor.g ), 0.05, 1.0 );\n#endif')
  }
  mat.customProgramCacheKey = () => `atelier-lm-${useBox ? 'box' : 'nobox'}`
  return uniforms
}

export class MaterialLibrary {
  private sets = new Map<TexSet, { map: THREE.Texture, roughnessMap: THREE.Texture, normalMap: THREE.Texture }>()
  private base = new Map<string, THREE.MeshStandardMaterial>()

  constructor(private loader: THREE.TextureLoader, private maxAniso: number, private base_url: string, private lowQuality: boolean) {}

  async load() {
    const sets: TexSet[] = ['basalt_floor', 'limestone', 'basalt', 'ceramic', 'plaster', 'brushed', 'fabric']
    await Promise.all(sets.map(async (s) => {
      const [map, roughnessMap, normalMap] = await Promise.all(['albedo', 'rough', 'normal'].map(k =>
        this.loader.loadAsync(`${this.base_url}/textures/${s}_${k}${this.lowQuality ? '_m' : ''}.webp`)))
      map.colorSpace = THREE.SRGBColorSpace
      for (const t of [map, roughnessMap, normalMap]) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.anisotropy = this.maxAniso
      }
      this.sets.set(s, { map, roughnessMap, normalMap })
    }))
    for (const [name, spec] of Object.entries(SPECS)) {
      const m = this.create(spec)
      m.name = name
      this.base.set(name, m)
    }
  }

  private create(spec: Spec) {
    const usePhysical = spec.physical && !this.lowQuality
    const m = usePhysical ? new THREE.MeshPhysicalMaterial() : new THREE.MeshStandardMaterial()
    m.color.set(spec.color)
    m.roughness = spec.roughness
    m.metalness = spec.metalness ?? 0
    m.envMapIntensity = spec.envIntensity ?? 1
    if (spec.tex) {
      const set = this.sets.get(spec.tex)!
      const rep = 1 / (spec.tile ?? 1)
      const clone = (t: THREE.Texture) => { const c = t.clone(); c.repeat.set(rep, rep); c.needsUpdate = true; return c }
      m.map = clone(set.map)
      m.roughnessMap = clone(set.roughnessMap)
      m.normalMap = clone(set.normalMap)
      const ns = spec.normalScale ?? 1
      m.normalScale.set(ns, -ns)
    }
    if (spec.vertexTone) m.vertexColors = true
    if (usePhysical && spec.anisotropy) {
      const p = m as THREE.MeshPhysicalMaterial
      p.anisotropy = spec.anisotropy
    }
    return m
  }

  has(name: string) { return this.base.has(name) }

  /** Per-zone instance (own lightmap / envMap) sharing textures. */
  instance(name: string) {
    return this.base.get(name)!.clone()
  }
}
