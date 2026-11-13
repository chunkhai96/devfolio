import * as THREE from 'three'

/**
 * Twilight sky dome + distant ridgelines and a calm sea below the terrace.
 * Colours mirror the Blender world ramp so baked light and visible sky agree.
 */
const SKY_GLSL = /* glsl */`
vec3 skyColor( vec3 d ) {
  float h = d.y;
  float t = clamp( ( h + 0.1 ) / 1.1, 0.0, 1.0 );
  vec3 c0 = vec3( 0.010, 0.010, 0.014 );
  vec3 c1 = vec3( 0.06, 0.035, 0.025 );
  vec3 c2 = vec3( 0.46, 0.22, 0.09 );
  vec3 c3 = vec3( 0.12, 0.085, 0.075 );
  vec3 c4 = vec3( 0.032, 0.05, 0.10 );
  vec3 c5 = vec3( 0.010, 0.022, 0.055 );
  vec3 c = mix( c0, c1, smoothstep( 0.0, 0.08, t ) );
  c = mix( c, c2, smoothstep( 0.08, 0.095, t ) );
  c = mix( c, c3, smoothstep( 0.095, 0.16, t ) );
  c = mix( c, c4, smoothstep( 0.16, 0.4, t ) );
  c = mix( c, c5, smoothstep( 0.4, 1.0, t ) );
  // warmer glow toward the north-west where the sun has set
  vec3 sunDir = normalize( vec3( -0.35, 0.0, -1.0 ) );
  float g = pow( max( dot( normalize( vec3( d.x, 0.0, d.z ) ), sunDir ), 0.0 ), 6.0 );
  c += vec3( 0.35, 0.16, 0.07 ) * g * exp( -max( h, 0.0 ) * 14.0 ) * 0.6;
  return c;
}
float hash12( vec2 p ) { vec3 p3 = fract( vec3( p.xyx ) * 0.1031 ); p3 += dot( p3, p3.yzx + 33.33 ); return fract( ( p3.x + p3.y ) * p3.z ); }
`

export function createSky() {
  const group = new THREE.Group()
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uIntensity: { value: 1.0 } },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main() {
        vDir = normalize( position );
        vec4 p = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */`
      uniform float uIntensity;
      varying vec3 vDir;
      ${SKY_GLSL}
      void main() {
        vec3 c = skyColor( normalize( vDir ) ) * uIntensity;
        c += ( hash12( gl_FragCoord.xy ) - 0.5 ) / 255.0;
        gl_FragColor = vec4( c, 1.0 );
      }`,
  })
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), skyMat)
  sky.renderOrder = -10
  sky.frustumCulled = false
  group.add(sky)

  // ridgelines: three layered silhouettes with atmospheric perspective
  const ridgeMat = (depth: number) => new THREE.ShaderMaterial({
    fog: false, depthWrite: true,
    uniforms: { uDepth: { value: depth } },
    vertexShader: /* glsl */`
      attribute float aTop;
      varying vec3 vW;
      varying float vTop;
      void main() { vTop = aTop; vec4 w = modelMatrix * vec4( position, 1.0 ); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */`
      uniform float uDepth;
      varying vec3 vW;
      varying float vTop;
      ${SKY_GLSL}
      float vnoise( vec2 p ) { vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f );
        return mix( mix( hash12( i ), hash12( i + vec2( 1, 0 ) ), f.x ), mix( hash12( i + vec2( 0, 1 ) ), hash12( i + vec2( 1, 1 ) ), f.x ), f.y ); }
      void main() {
        vec3 dir = normalize( vW - cameraPosition );
        vec3 haze = mix( skyColor( vec3( dir.x, 0.02, dir.z ) ), vec3( 0.07, 0.075, 0.11 ), 0.55 );
        vec3 land = vec3( 0.004, 0.005, 0.008 );
        float h = clamp( ( vW.y + 40.0 ) / 120.0, 0.0, 1.0 );
        // aerial perspective: near ridges are cool, near-black silhouettes; far ones dissolve into haze
        vec3 cool = mix( land, vec3( 0.03, 0.035, 0.05 ), uDepth );
        // terrain texture: slope striations + scrub noise, strongest on near ridges
        float ang = atan( vW.z, vW.x );
        float tex = vnoise( vec2( ang * 900.0, vW.y * 0.35 ) ) * 0.6 + vnoise( vec2( ang * 2600.0, vW.y * 1.4 ) ) * 0.4;
        cool *= mix( 1.0, 0.65 + 0.7 * tex, 1.0 - uDepth );
        // crest catches the afterglow; valleys sink into haze
        cool += vec3( 0.06, 0.035, 0.02 ) * pow( vTop, 10.0 ) * ( 1.0 - uDepth );
        float mist = smoothstep( 0.35, 0.0, vTop ) * 0.35;
        vec3 c = mix( cool, haze * 0.9, clamp( uDepth * uDepth * 1.4 + h * 0.08 + mist * ( 0.4 + uDepth ), 0.0, 1.0 ) );
        c += ( hash12( gl_FragCoord.xy ) - 0.5 ) / 255.0;
        gl_FragColor = vec4( c, 1.0 );
      }`,
  })
  const ridge = (dist: number, height: number, seed: number, depth: number, span = 1.1) => {
    const segs = 900
    const pos: number[] = []
    const top: number[] = []
    const idx: number[] = []
    for (let i = 0; i <= segs; i++) {
      const a = -Math.PI / 2 - span + (2 * span) * (i / segs)
      const u = i / segs
      let hgt = 0
      let amp = 1
      let f = 1
      for (let o = 0; o < 5; o++) {
        hgt += amp * Math.sin(u * f * 9.0 + seed * (o + 1) * 1.7) * Math.cos(u * f * 4.3 + seed * 0.37 * o)
        amp *= 0.5; f *= 2.1
      }
      const y = -40 + height * (0.55 + 0.45 * hgt)
      const x = Math.cos(a) * dist
      const z = Math.sin(a) * dist
      pos.push(x, -60, z, x, y, z)
      top.push(0, 1)
      if (i < segs) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3) }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('aTop', new THREE.Float32BufferAttribute(top, 1))
    g.setIndex(idx)
    const m = new THREE.Mesh(g, ridgeMat(depth))
    m.frustumCulled = false
    return m
  }
  group.add(ridge(780, 60, 1.3, 0.7, 2.0))
  group.add(ridge(540, 42, 2.9, 0.4, 1.7))
  group.add(ridge(340, 24, 4.1, 0.08, 1.3))

  // sea: analytic fresnel reflection of the sky with slow micro-ripples
  const seaMat = new THREE.ShaderMaterial({
    fog: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4( position, 1.0 ); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */`
      uniform float uTime;
      varying vec3 vW;
      ${SKY_GLSL}
      void main() {
        vec3 v = normalize( vW - cameraPosition );
        vec2 p = vW.xz * 0.05;
        vec3 n = normalize( vec3(
          0.016 * sin( p.x * 3.1 + uTime * 0.3 ) + 0.009 * sin( p.y * 5.3 - uTime * 0.21 + p.x ),
          1.0,
          0.016 * cos( p.y * 2.7 - uTime * 0.25 ) + 0.009 * cos( p.x * 4.1 + uTime * 0.17 ) ) );
        vec3 r = reflect( v, n );
        r.y = abs( r.y );
        float f = 0.02 + 0.98 * pow( 1.0 - max( dot( -v, n ), 0.0 ), 5.0 );
        vec3 c = mix( vec3( 0.006, 0.008, 0.011 ), skyColor( r ), f );
        float dist = length( vW.xz - cameraPosition.xz );
        c = mix( c, skyColor( vec3( v.x, 0.0, v.z ) ) * 0.55, smoothstep( 300.0, 900.0, dist ) );
        c += ( hash12( gl_FragCoord.xy ) - 0.5 ) / 255.0;
        gl_FragColor = vec4( c, 1.0 );
      }`,
  })
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), seaMat)
  sea.rotation.x = -Math.PI / 2
  sea.position.y = -40
  sea.frustumCulled = false
  group.add(sea)

  const waterMat = new THREE.ShaderMaterial({
    fog: false,
    uniforms: seaMat.uniforms,
    vertexShader: seaMat.vertexShader,
    fragmentShader: /* glsl */`
      uniform float uTime;
      varying vec3 vW;
      ${SKY_GLSL}
      void main() {
        vec3 v = normalize( vW - cameraPosition );
        vec2 p = vW.xz * 0.9;
        vec3 n = normalize( vec3(
          0.012 * sin( p.x * 2.3 + uTime * 0.6 ) + 0.008 * sin( p.y * 3.7 - uTime * 0.45 + p.x * 0.5 ),
          1.0,
          0.012 * cos( p.y * 2.1 - uTime * 0.5 ) + 0.008 * cos( p.x * 3.1 + uTime * 0.37 ) ) );
        vec3 r = reflect( v, n );
        r.y = abs( r.y );
        float f = 0.03 + 0.97 * pow( 1.0 - max( dot( -v, n ), 0.0 ), 5.0 );
        vec3 c = mix( vec3( 0.004, 0.005, 0.007 ), skyColor( r ), f );
        c += ( hash12( gl_FragCoord.xy ) - 0.5 ) / 255.0;
        gl_FragColor = vec4( c, 1.0 );
      }`,
  })

  return {
    group,
    waterMaterial: waterMat,
    update(t: number) { seaMat.uniforms.uTime.value = t },
    setIntensity(v: number) { skyMat.uniforms.uIntensity.value = v },
  }
}
