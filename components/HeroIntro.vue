<script lang="ts" setup>
import { landing, whatido, experience } from '~/utils/atelier'
const st = useAtelier()
const current = experience.timelineItems[0]

function explore() {
  st.exploring.value = true
}
</script>
<template>
  <section class="hero" aria-labelledby="hero-title">
    <p class="eyebrow hero-eyebrow">{{ current.title }}<span class="sep" aria-hidden="true">/</span><span class="sr-only">, </span>{{ current.company.replace(/^.*\((.*)\)$/, '$1') }}</p>
    <h1 id="hero-title" class="hero-name">{{ landing.title }}</h1>
    <p class="hero-desc">{{ landing.description }}</p>
    <p class="hero-roles">
      <template v-for="(r, i) in whatido.roles" :key="r"><span v-if="i" class="dot" aria-hidden="true">·</span><span v-if="i" class="sr-only">, </span>{{ r }}</template>
    </p>
    <div class="hero-actions">
      <button type="button" class="btn btn-primary" @click="explore">
        <Icon name="compass" />Explore the atelier
      </button>
      <button type="button" class="btn btn-ghost" @click="st.goZone('gallery')">View projects</button>
      <button type="button" class="btn btn-ghost" @click="st.openPanel({ type: 'contact' })">Get in touch</button>
    </div>
    <div class="hero-foot">
      <a :href="landing.resumeSrc" target="_blank" rel="noopener" class="resume"><Icon name="doc" :size="16" />Résumé</a>
      <span class="rule" aria-hidden="true" />
      <SocialLinks size="sm" />
    </div>
  </section>
</template>
<style scoped>
.hero {
  position: absolute; left: clamp(24px, 6vw, 112px); top: 50%; transform: translateY(-46%);
  max-width: 560px; z-index: 20; isolation: isolate;
}
/* local scrim travels with the copy so contrast holds whatever the scene composition behind it */
.hero::before {
  content: ''; position: absolute; inset: -90px -140px -80px -160px; z-index: -1; pointer-events: none;
  background: radial-gradient(closest-side, rgba(10, 13, 17, 0.84) 0%, rgba(10, 13, 17, 0.72) 55%, rgba(10, 13, 17, 0) 100%);
}
.hero-eyebrow { color: var(--ice-cyan); margin-bottom: 22px; }
.sep { margin: 0 10px; color: var(--titanium); }
.hero-name {
  font-family: var(--font-display); font-weight: 600; letter-spacing: -0.025em;
  font-size: clamp(3rem, 6vw, 6.25rem); line-height: 0.95; color: var(--porcelain);
}
.hero-desc { margin-top: 26px; font-size: clamp(1.125rem, 1.45vw, 1.4rem); line-height: 1.5; color: var(--porcelain); max-width: 30ch; }
.hero-roles { margin-top: 10px; font-size: 0.98rem; color: var(--mist); opacity: 0.82; }
.dot { margin: 0 10px; color: var(--titanium); }
.hero-actions { margin-top: 36px; display: flex; flex-wrap: wrap; gap: 10px; }
.hero-foot { margin-top: 36px; display: flex; align-items: center; gap: 14px; }
.resume { display: inline-flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--mist); height: 40px; }
.resume:hover { color: #fff; }
.rule { width: 1px; height: 20px; background: var(--hairline); }
@media (max-width: 760px), (max-aspect-ratio: 4/5) {
  .hero { left: 16px; right: 16px; top: auto; bottom: 20px; transform: none; max-width: none; }
  .hero::before { inset: -150px -16px -20px -16px; background: linear-gradient(0deg, rgba(10, 13, 17, 0.92) 0%, rgba(10, 13, 17, 0.9) 72%, rgba(10, 13, 17, 0)); }
  .hero-eyebrow { margin-bottom: 14px; font-size: 0.68rem; }
  .hero-desc { margin-top: 14px; }
  .hero-actions { margin-top: 22px; }
  .hero-actions .btn { flex: 1 1 auto; }
  .hero-actions .btn-primary { flex-basis: 100%; }
  .hero-foot { margin-top: 18px; flex-wrap: wrap; gap: 6px; }
  .rule { display: none; }
}
/* short portrait screens (iPhone SE class): keep the whole intro below the header */
@media (max-aspect-ratio: 4/5) and (max-height: 720px) {
  .hero { bottom: 14px; }
  .hero-eyebrow { margin-bottom: 8px; }
  .hero-name { font-size: 2.6rem; }
  .hero-desc { margin-top: 10px; font-size: 1.02rem; }
  .hero-roles { font-size: 0.875rem; margin-top: 6px; }
  .hero-actions { margin-top: 16px; gap: 8px; }
  .hero-foot { margin-top: 10px; }
  .rule { display: none; }
  .resume { height: 32px; font-size: 0.8125rem; }
  .hero-foot :deep(.social) { flex-wrap: nowrap; gap: 0; }
}
</style>
