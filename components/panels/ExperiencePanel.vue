<script lang="ts" setup>
import { experience } from '~/utils/atelier'
const props = defineProps<{ focus?: number }>()
const items = ref<HTMLElement[]>([])
watch(() => props.focus, (f) => {
  if (f !== undefined) nextTick(() => items.value[f]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
}, { immediate: true })
</script>
<template>
  <article>
    <p class="eyebrow">04 <span class="sep">/</span> Career Corridor</p>
    <h2 id="panel-title" tabindex="-1" class="ptitle">{{ experience.title }}</h2>
    <ol class="tl">
      <li v-for="(e, i) in experience.timelineItems" :key="e.title + e.company" ref="items" :class="{ on: focus === i }">
        <span class="node" aria-hidden="true" />
        <p class="when">{{ e.duration }}</p>
        <h3>{{ e.title }}</h3>
        <p class="org">{{ e.company }}</p>
        <p class="desc">{{ e.description }}</p>
      </li>
    </ol>
  </article>
</template>
<style scoped>
.sep { color: rgba(138, 150, 158, 0.6); margin: 0 6px; }
.ptitle { font-family: var(--font-display); font-weight: 600; font-size: clamp(2rem, 2.6vw, 2.6rem); line-height: 1.05; letter-spacing: -0.015em; margin-top: 14px; }
.tl { margin-top: 30px; position: relative; padding-left: 26px; }
.tl::before { content: ''; position: absolute; left: 4px; top: 8px; bottom: 8px; width: 1px; background: linear-gradient(to bottom, rgba(154, 216, 214, 0.6), rgba(138, 150, 158, 0.2)); }
.tl li { position: relative; padding: 0 0 30px; scroll-margin: 24px; }
.node { position: absolute; left: -26px; top: 6px; width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid var(--titanium); background: var(--ink); }
.tl li:first-child .node, .tl li.on .node { border-color: var(--ice-cyan); background: var(--ice-cyan); }
.when { font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--titanium); }
.tl li.on .when { color: var(--ice-cyan); }
h3 { margin-top: 6px; font-family: var(--font-display); font-size: 1.3rem; font-weight: 600; }
.org { margin-top: 2px; color: var(--mist); font-size: 0.95rem; }
.desc { margin-top: 10px; color: var(--mist); opacity: 0.88; line-height: 1.65; font-size: 1rem; }
</style>
