import * as THREE from 'three'

/**
 * Very restrained volumetric shaft from the oculus to the plinth. Additive, depth-tested,
 * fades with height and view angle so it reads as air rather than as an object.
 */
export function createShaft(top: THREE.Vector3, bottomY: number, rTop: number, rBottom: number) {
  const h = top.y - bottomY
  const geo = new THREE.CylinderGeometry(rTop, rBottom, h, 64, 1, true)
  geo.translate(0, -h / 2, 0)
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uTime: { value: 0 }, uStrength: { value: 0.05 }, uColor: { value: new THREE.Color(1.0, 0.92, 0.82) } },
    vertexShader: /* glsl */`
      varying vec3 vN; varying vec3 vW; varying float vH;
      uniform float uTime;
      void main() {
        vH = -position.y / ${h.toFixed(3)};
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vN; varying vec3 vW; varying float vH;
      uniform float uTime; uniform float uStrength; uniform vec3 uColor;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
      float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
      void main() {
        vec3 v = normalize(cameraPosition - vW);
        float rim = pow(clamp(1.0 - abs(dot(v, normalize(vN))), 0.0, 1.0), 1.6);
        float edge = 1.0 - rim;                 // thicker through the middle of the column
        float fade = smoothstep(0.0, 0.18, vH) * (1.0 - smoothstep(0.55, 1.0, vH));
        float ang = atan(vW.z, vW.x);
        float streak = 0.65 + 0.35 * noise(vec2(ang * 6.0, vH * 2.0 - uTime * 0.03));
        float a = uStrength * edge * fade * streak;
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.copy(top)
  mesh.renderOrder = 5
  return {
    mesh,
    update(t: number) { mat.uniforms.uTime.value = t },
    setStrength(s: number) { mat.uniforms.uStrength.value = s },
  }
}
