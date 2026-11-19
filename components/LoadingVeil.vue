<script lang="ts" setup>
/**
 * Start-up state for the 3D atelier: a centred veil over the page with a miniature Kinetic Field
 * (the atrium's titanium droplets on fine cables), the current build step and honest progress.
 * Server-rendered, and every animation is CSS on the compositor, so it moves from the first paint
 * and keeps moving while the page is busy. Visitors can always step past it: "Browse while it
 * loads" swaps it for a compact status pill, and the text view is one link away.
 */
const st = useAtelier()
const skipped = useLoaderSkipped()
const loading = computed(() => st.webgl.value !== 'none' && !st.ready.value)

const STEPS = {
  start: [1, 'Starting the atelier'],
  download: [1, 'Loading the rooms'],
  screens: [2, 'Hanging the exhibits'],
  shaders: [3, 'Preparing the materials'],
  textures: [4, 'Finishing the surfaces'],
  lighting: [5, 'Setting the lights'],
  ready: [5, 'Opening the doors'],
} as const
const step = computed(() => STEPS[st.loadStage.value ?? 'start'])
const pct = computed(() => Math.round(st.progress.value * 100))

// three rows of droplets for depth; the phase offset along each row makes the slow travelling wave
const COLS = 13
const ROWS = [
  { len: 52, size: 5, opacity: 0.34, shift: 0.5 },
  { len: 68, size: 7, opacity: 0.6, shift: 0.25 },
  { len: 84, size: 8, opacity: 0.95, shift: 0 },
]
const drops = ROWS.flatMap((r, row) => Array.from({ length: COLS }, (_, col) => ({
  key: `${row}-${col}`,
  style: {
    left: `${((col + 0.5 + r.shift) / (COLS + 0.5)) * 100}%`,
    height: `${r.len}px`,
    opacity: r.opacity,
    '--size': `${r.size}px`,
    '--delay': `${-(col * 0.28 + row * 0.6).toFixed(2)}s`,
    // resting pose for reduced motion: the same wave, held still
    '--rest': `${(7 * Math.sin(col * 0.55 + row * 0.9)).toFixed(1)}px`,
  },
})))
</script>

<template>
  <Transition name="veil">
    <div v-if="loading && !skipped" class="veil">
      <div class="veil-inner">
        <div class="field" aria-hidden="true">
          <span v-for="d in drops" :key="d.key" class="cord" :style="d.style"><span class="drop" /></span>
        </div>
        <p class="eyebrow">The Digital Atelier</p>
        <p class="step" role="status">
          <span class="sr-only">Loading the 3D atelier: </span>{{ step[1] }}
        </p>
        <div class="meta" aria-hidden="true">
          <span>{{ String(step[0]).padStart(2, '0') }} / 05</span>
          <span>{{ pct }}%</span>
        </div>
        <span class="track" role="progressbar" aria-label="3D atelier loading" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="pct">
          <span class="fill" :style="{ transform: `scaleX(${st.progress.value})` }" />
        </span>
        <div class="actions">
          <button type="button" class="act" @click="skipped = true">Browse while it loads</button>
          <span class="sep" aria-hidden="true">·</span>
          <NuxtLink to="/overview" class="act">Text view</NuxtLink>
        </div>
        <p class="slow">Some devices take a little longer. The atelier opens on its own when it is ready.</p>
      </div>
    </div>
  </Transition>
  <!-- after "Browse while it loads": a quiet status pill under the header until the 3D is ready -->
  <Transition name="fade">
    <div v-if="loading && skipped" class="pill" role="status">
      <span class="spin" aria-hidden="true" />
      <span><span class="sr-only">Loading the 3D atelier: </span>{{ step[1] }}</span>
      <span class="ppct" aria-hidden="true">{{ pct }}%</span>
      <span class="ptrack" aria-hidden="true"><span class="fill" :style="{ transform: `scaleX(${st.progress.value})` }" /></span>
    </div>
  </Transition>
</template>

<style scoped>
.veil {
  position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; padding: 24px 16px;
  background:
    radial-gradient(70% 55% at 50% 42%, rgba(26, 34, 41, 0.55) 0%, rgba(9, 11, 14, 0) 70%),
    rgba(9, 11, 14, 0.86);
  backdrop-filter: blur(14px) saturate(0.8); -webkit-backdrop-filter: blur(14px) saturate(0.8);
}
.veil-inner { display: flex; flex-direction: column; align-items: center; width: min(320px, 100%); text-align: center; }

/* miniature Kinetic Field: a ceiling line, light from the oculus above, droplets on cables */
.field {
  position: relative; width: 280px; height: 140px; margin-bottom: 26px; overflow: hidden;
  border-top: 1px solid rgba(138, 150, 158, 0.35);
  background: radial-gradient(55% 90% at 50% 0%, rgba(230, 223, 211, 0.1) 0%, rgba(230, 223, 211, 0) 72%);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
}
.cord {
  position: absolute; top: -20px; width: 1px; padding-top: 20px; box-sizing: content-box;
  background: linear-gradient(180deg, rgba(138, 150, 158, 0) 0%, rgba(138, 150, 158, 0.55) 60%);
  transform: translateY(var(--rest)); will-change: transform;
  animation: drift 3.6s ease-in-out var(--delay) infinite;
}
.drop {
  position: absolute; left: 50%; bottom: calc(var(--size) * -0.9); width: var(--size); height: var(--size);
  margin-left: calc(var(--size) / -2); border-radius: 0 50% 50% 50%; transform: rotate(45deg);
  background: radial-gradient(circle at 34% 34%, var(--porcelain) 0%, var(--titanium) 52%, var(--graphite) 100%);
}
@keyframes drift {
  0%, 100% { transform: translateY(-9px); }
  50% { transform: translateY(9px); }
}

.eyebrow { margin: 0 0 10px; font-family: var(--font-mono); font-size: 0.6875rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--titanium); }
.step { margin: 0; font-family: var(--font-display); font-size: 1.375rem; font-weight: 500; letter-spacing: -0.01em; color: var(--porcelain); min-height: 1.4em; }
.meta { display: flex; justify-content: space-between; width: 200px; margin: 18px 0 8px; font-family: var(--font-mono); font-size: 0.6875rem; letter-spacing: 0.08em; color: var(--titanium); }
.track { position: relative; display: block; width: 200px; height: 1px; background: rgba(215, 223, 223, 0.16); overflow: hidden; }
.fill { position: absolute; inset: 0; background: var(--ice-cyan); transform-origin: left; transition: transform 400ms var(--ease-out); }
.track::after, .ptrack::after {
  content: ''; position: absolute; top: 0; bottom: 0; width: 35%;
  background: linear-gradient(90deg, transparent, rgba(242, 240, 233, 0.8), transparent);
  animation: sweep 1800ms var(--ease-out) infinite;
}
@keyframes sweep { from { transform: translateX(-100%); } to { transform: translateX(300%); } }

/* reassurance and ways out arrive only if loading is slow, so fast devices never see them */
.slow { margin: 14px 0 0; max-width: 280px; font-size: 0.8125rem; line-height: 1.55; color: var(--mist); animation: appear 600ms var(--ease-out) 8s both; }
.actions { display: flex; align-items: center; gap: 10px; margin-top: 26px; font-size: 0.8125rem; animation: appear 600ms var(--ease-out) 3s both; }
.act { background: none; border: 0; padding: 6px 2px; font: inherit; color: var(--mist); cursor: pointer; text-decoration: underline; text-decoration-color: rgba(215, 223, 223, 0.35); text-underline-offset: 3px; }
.act:hover, .act:focus-visible { color: var(--porcelain); text-decoration-color: var(--ice-cyan); }
.sep { color: var(--titanium); }
@keyframes appear { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

.veil-leave-active { transition: opacity 700ms var(--ease-out); }
.veil-leave-to { opacity: 0; }

.pill {
  position: fixed; left: 50%; top: 84px; transform: translateX(-50%); z-index: 25; overflow: hidden;
  display: flex; align-items: center; gap: 10px; padding: 8px 16px 9px 12px; border-radius: 999px; white-space: nowrap;
  background: rgba(12, 16, 21, 0.78); border: 1px solid var(--hairline); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  font-size: 0.8125rem; color: var(--mist); pointer-events: none;
}
.spin { width: 13px; height: 13px; border-radius: 50%; border: 1.5px solid rgba(154, 216, 214, 0.22); border-top-color: var(--ice-cyan); animation: spin 900ms linear infinite; }
.ppct { min-width: 4ch; text-align: right; font-family: var(--font-mono); font-size: 0.75rem; color: var(--titanium); }
.ptrack { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: rgba(215, 223, 223, 0.08); overflow: hidden; }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 400ms var(--ease-out); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .cord, .spin { animation: none; }
  .track::after, .ptrack::after { display: none; }
  .spin { border-color: rgba(154, 216, 214, 0.5); }
}
@media (max-width: 420px) {
  .field { width: 240px; height: 128px; }
  .step { font-size: 1.25rem; }
}
</style>
