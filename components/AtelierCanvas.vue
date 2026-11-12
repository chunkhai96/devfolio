<script lang="ts" setup>
import { markRaw } from 'vue'
import type { AtelierEngine, Interactable } from '~/three/engine'
import { buildContent, buildInteractables, panelFor, hashToState } from '~/utils/atelier'

const st = useAtelier()
const canvas = ref<HTMLCanvasElement>()
const interactables = buildInteractables()
let eng: AtelierEngine | null = null
let markerMap: Map<string, HTMLElement> | null = null
let alive = true

function insets() {
  const w = window.innerWidth
  const h = window.innerHeight
  // the desktop guide is a short card over the floor: frame rooms a little right of centre, not past it
  if (w > 900) return { right: Math.min(560, w * 0.42) + 16, bottom: 0, left: 190, guideBottom: 0 }
  return { right: 0, bottom: h * 0.62, left: 0, guideBottom: w <= 760 ? 190 : 230 }
}

function onActivate(it: Interactable) {
  if (it.kind === 'destination' && it.dest) { st.goZone(it.dest); return }
  if (it.kind === 'feature') {
    st.showToast('Kinetic Field — titanium droplets on fine cables, slowly re-fitting a surface. Click it again to send a ripple through it.')
    return
  }
  const p = panelFor(it.id)
  if (p) st.openPanel(p, { fromExhibit: it.id })
}

function applyHash(instant: boolean) {
  const { zone, panel } = hashToState(location.hash)
  if (panel) st.openPanel(panel, { push: false, instant })
  else if (zone !== st.zone.value || st.panel.value) st.goZone(zone, { push: false, instant })
}

const onPop = () => applyHash(false)
const onResize = () => { const i = insets(); eng?.setInset(i.right, i.bottom, i.left, i.guideBottom) }

function onMarkers(map: Map<string, HTMLElement>) {
  markerMap = map
  eng?.setMarkers(map)
}

onMounted(async () => {
  const probe = document.createElement('canvas')
  const gl = probe.getContext('webgl2')
  if (!gl || new URLSearchParams(location.search).has('nowebgl')) { st.webgl.value = 'none'; return }
  st.webgl.value = 'ok'
  const rm = window.matchMedia('(prefers-reduced-motion: reduce)')
  st.reducedMotion.value = rm.matches
  rm.addEventListener?.('change', (e) => { st.reducedMotion.value = e.matches; eng?.setReducedMotion(e.matches) })
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const lowQuality = coarse || Math.min(window.innerWidth, window.innerHeight) < 600 || (navigator.hardwareConcurrency || 8) <= 4
    || new URLSearchParams(location.search).has('low')

  // honour deep links immediately for the UI, even before 3D is ready
  const initial = hashToState(location.hash)
  if (initial.zone !== 'atrium' || initial.panel) {
    // deep link: swap the server-rendered hero for the target state without a visible cross-fade
    document.documentElement.classList.add('no-anim')
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove('no-anim')))
  }
  st.zone.value = initial.zone
  st.panel.value = initial.panel
  if (initial.zone !== 'atrium' || initial.panel) st.exploring.value = true

  let e: AtelierEngine | null = null
  try {
    const { AtelierEngine } = await import('~/three/engine')
    if (!alive) return
    e = eng = new AtelierEngine({
      canvas: canvas.value!, content: buildContent(), interactables, lowQuality, reducedMotion: rm.matches,
      callbacks: {
        onProgress: (l, t) => { st.progress.value = l / t },
        onHover: (id) => { st.hovered.value = id },
        onActivate,
        onZone: (z) => { st.zone.value = z },
        onMoving: (m) => { st.moving.value = m },
      },
    })
    const i = insets()
    e.setInset(i.right, i.bottom, i.left, i.guideBottom)
    await e.init()
    if (!alive) { e.dispose(); return }
    if (markerMap) e.setMarkers(markerMap)
    st.engine.value = markRaw({
      goZone: (z, instant) => e!.goZone(z, instant),
      focus: (id, instant) => e!.focus(id, instant),
      unfocus: () => e!.unfocus(),
      activate: (id) => e!.activate(id),
      setFocus: (id) => e!.setFocus(id),
      setPanelOpen: (o) => e!.setPanelOpen(o),
      setInset: (r, b) => e!.setInset(r, b),
      setReducedMotion: (v) => e!.setReducedMotion(v),
    })
    if (import.meta.dev) (window as unknown as { __atelier: AtelierEngine }).__atelier = e
    if (initial.panel) { e.setPanelOpen(true); await e.focus(exhibitFor(initial.panel), true) }
    else if (initial.zone !== 'atrium') await e.goZone(initial.zone, true)
    st.ready.value = true
  } catch (err) {
    if (!alive) return
    console.error('[atelier] 3D unavailable, falling back to text view', err)
    e?.dispose()
    st.webgl.value = 'none'
    return
  }
  window.addEventListener('popstate', onPop)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  alive = false
  window.removeEventListener('popstate', onPop)
  window.removeEventListener('resize', onResize)
  st.engine.value = null
  st.ready.value = false
  eng?.dispose()
  eng = null
})
</script>
<template>
  <div class="stage" :class="{ ready: st.ready.value }">
    <canvas ref="canvas" class="gl" aria-label="Interactive 3D atelier. All content is also available through the room guide and the text view." role="img" />
    <MarkerLayer v-if="st.webgl.value === 'ok'" :items="interactables" @ready="onMarkers" />
  </div>
</template>
<style scoped>
.stage { position: absolute; inset: 0; }
.gl { position: absolute; inset: 0; width: 100%; height: 100%; display: block; opacity: 0; transition: opacity 1200ms var(--ease-out); touch-action: none; }
.ready .gl { opacity: 1; }
</style>
