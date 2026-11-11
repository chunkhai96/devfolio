<script lang="ts" setup>
import { landing } from '~/utils/atelier'

useSeoMeta({
  title: 'Andy Pang — Machine Learning Engineer',
  description: 'Andy Pang (Pang Chun Khai) — machine learning engineer, full stack developer and data scientist. Explore projects, capabilities and experience in an interactive 3D atelier.',
})
useHead({
  link: [{ rel: 'alternate', href: '/overview', title: 'Text view' }],
  noscript: [{ innerHTML: `<p style="position:fixed;bottom:16px;left:16px;z-index:99;color:#d7dfdf">JavaScript is off — <a href="/overview" style="color:#9ad8d6">open the text view of ${landing.title}'s portfolio</a>.</p>` }],
})
const route = useRoute()
const hideUi = computed(() => route.query.ui === '0')

const st = useAtelier()
const showHero = computed(() => st.zone.value === 'atrium' && !st.panel.value && !st.exploring.value)
const showGuide = computed(() => st.webgl.value !== 'none' && !st.panel.value && !showHero.value)
const loading = computed(() => st.webgl.value === 'ok' && !st.ready.value)

// when the hero (and the focused control inside it) leaves, hand keyboard focus to the room guide
watch(showHero, (v) => {
  if (v || !import.meta.client) return
  setTimeout(() => {
    const a = document.activeElement
    if (!a || a === document.body || !a.isConnected) document.querySelector<HTMLElement>('.guide h2')?.focus({ preventScroll: true })
  }, 480)
})
</script>
<template>
  <div class="atelier" :class="{ 'panel-open': !!st.panel.value, 'hide-ui': hideUi }">
    <nav aria-label="Skip links">
      <a href="#main-content" class="skip-link">Skip to content</a>
      <NuxtLink to="/overview" class="skip-link" style="left: 180px">Text view</NuxtLink>
    </nav>
    <SiteHeader />
    <main id="main-content" class="stage-wrap">
      <div class="poster" :class="{ hide: st.ready.value }" aria-hidden="true" />
      <ClientOnly><AtelierCanvas /></ClientOnly>
      <div class="scrim" :class="{ on: showHero }" aria-hidden="true" />
      <Transition name="fade"><HeroIntro v-if="showHero && st.webgl.value !== 'none'" /></Transition>
      <Transition name="fade"><RoomGuide v-if="showGuide" /></Transition>
      <ExhibitPanel />
      <Transition name="fade">
        <div v-if="loading" class="loader" role="status" aria-live="polite">
          <span class="ltxt">{{ st.progress.value >= 1 ? 'Atelier ready' : 'Preparing the atelier' }}</span>
          <span class="lbar"><span :style="{ transform: `scaleX(${st.progress.value})` }" /></span>
          <span class="lpct">{{ Math.round(st.progress.value * 100) }}%</span>
        </div>
      </Transition>
      <Transition name="fade">
        <p v-if="st.toast.value" class="toast" role="status">{{ st.toast.value }}</p>
      </Transition>
      <Transition name="fade">
        <p v-if="st.exploring.value && st.zone.value === 'atrium' && !st.panel.value && st.ready.value" class="hint">
          Drag to look around · select a doorway, or use the room guide
        </p>
      </Transition>
    </main>
    <div v-if="st.webgl.value === 'none'" class="fallback">
      <p class="fb-note">Showing the text edition — the interactive 3D atelier needs WebGL 2.</p>
      <PortfolioDocument />
    </div>
  </div>
</template>
<style scoped>
.atelier { position: relative; }
.hide-ui :deep(.site-header), .hide-ui :deep(.hero), .hide-ui :deep(.guide), .hide-ui .scrim, .hide-ui :deep(.markers) { display: none !important; }
.stage-wrap { position: fixed; inset: 0; overflow: hidden; background: radial-gradient(120% 90% at 60% 40%, #1a2128 0%, #0d1014 60%, #090b0e 100%); }
.fallback ~ .stage-wrap, .atelier:has(.fallback) .stage-wrap { position: relative; height: 0; }
.poster { position: absolute; inset: 0; background: url('/atelier/poster.webp') center / cover no-repeat; opacity: 0.85; transition: opacity 1200ms var(--ease-out); }
.poster.hide { opacity: 0; }
@media (max-aspect-ratio: 1/1) { .poster { background-image: url('/atelier/poster-portrait.webp'); } }
.scrim {
  position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity 600ms var(--ease-out);
  background: linear-gradient(90deg, rgba(10, 13, 17, 0.72) 0%, rgba(10, 13, 17, 0.45) 30%, rgba(10, 13, 17, 0) 55%);
}
.scrim.on { opacity: 1; }
.loader {
  position: absolute; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 25;
  display: flex; align-items: center; gap: 14px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.08em; color: var(--mist);
  text-transform: uppercase;
}
.lbar { width: 120px; height: 1px; background: rgba(215, 223, 223, 0.18); overflow: hidden; }
.lbar span { display: block; height: 100%; background: var(--ice-cyan); transform-origin: left; transition: transform 300ms var(--ease-out); }
.lpct { min-width: 3ch; color: var(--titanium); }
.toast {
  position: absolute; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 26; max-width: min(560px, calc(100% - 32px));
  padding: 12px 16px; border-radius: 12px; background: var(--panel); border: 1px solid var(--panel-border); color: var(--mist); font-size: 0.9rem; line-height: 1.5;
}
.hint {
  position: absolute; left: 50%; top: 84px; transform: translateX(-50%); z-index: 14; font-size: 0.8125rem; color: var(--mist); white-space: nowrap;
  padding: 7px 14px; border-radius: 999px; background: rgba(12, 16, 21, 0.72); border: 1px solid var(--hairline); backdrop-filter: blur(6px);
}
.fade-enter-active, .fade-leave-active { transition: opacity 400ms var(--ease-out); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fb-note { max-width: 1080px; margin: 88px auto 0; padding: 0 24px; color: var(--titanium); font-size: 0.875rem; }
.fallback .fb-note + * :deep(.doc) { padding-top: 32px; }
@media (max-width: 760px), (max-aspect-ratio: 4/5) {
  .scrim { background: linear-gradient(0deg, rgba(10, 13, 17, 0.88) 0%, rgba(10, 13, 17, 0.6) 38%, rgba(10, 13, 17, 0) 62%); }
  .hint { display: none; }
}
</style>
