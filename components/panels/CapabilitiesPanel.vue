<script lang="ts" setup>
import { whatido, keyPoints, iconUrl } from '~/utils/atelier'
const props = defineProps<{ focus?: number | 'stack' }>()
const tools = ref<HTMLElement>()
watch(() => props.focus, (f) => {
  if (f === 'stack') nextTick(() => tools.value?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
}, { immediate: true })
</script>
<template>
  <article>
    <p class="eyebrow">03 <span class="sep">/</span> Engineering Lab</p>
    <h2 id="panel-title" tabindex="-1" class="ptitle">{{ whatido.title }}</h2>
    <ol class="roles">
      <li v-for="(r, i) in whatido.roles" :key="r" :class="{ on: focus === i }">
        <span class="n">{{ String(i + 1).padStart(2, '0') }}</span>
        <div>
          <h3>{{ r }}</h3>
          <p v-if="keyPoints[i]">{{ keyPoints[i] }}</p>
        </div>
      </li>
    </ol>
    <section ref="tools" class="tools" :class="{ on: focus === 'stack' }" aria-labelledby="tools-h">
      <h3 id="tools-h" class="eyebrow">Tools in daily use</h3>
      <ul>
        <li v-for="t in whatido.techStackItems" :key="t.text">
          <img v-if="iconUrl(t.icon)" class="glyph-img ic" :src="iconUrl(t.icon)" alt="" aria-hidden="true" />
          {{ t.text }}
        </li>
      </ul>
    </section>
  </article>
</template>
<style scoped>
.sep { color: rgba(138, 150, 158, 0.6); margin: 0 6px; }
.ptitle { font-family: var(--font-display); font-weight: 600; font-size: clamp(2rem, 2.6vw, 2.6rem); line-height: 1.05; letter-spacing: -0.015em; margin-top: 14px; }
.roles { margin-top: 28px; border-top: 1px solid var(--hairline); }
.roles li { display: grid; grid-template-columns: 40px 1fr; gap: 8px; padding: 20px 0; border-bottom: 1px solid var(--hairline); transition: background-color 300ms; }
.roles li.on h3 { color: var(--ice-cyan); }
.n { font-family: var(--font-mono); font-size: 0.75rem; color: var(--titanium); padding-top: 5px; }
.roles h3 { font-family: var(--font-display); font-size: 1.3rem; font-weight: 600; transition: color 300ms; }
.roles p { margin-top: 6px; color: var(--mist); line-height: 1.6; font-size: 1rem; }
.tools { margin-top: 32px; scroll-margin-top: 24px; }
.tools ul { margin-top: 14px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.tools li { display: flex; align-items: center; gap: 12px; height: 52px; padding: 0 14px; border: 1px solid var(--hairline); border-radius: 10px; font-size: 0.95rem; color: var(--porcelain); }
.tools.on li { border-color: rgba(154, 216, 214, 0.28); }
.ic { width: 20px; height: 20px; color: var(--mist); flex: none; }
</style>
