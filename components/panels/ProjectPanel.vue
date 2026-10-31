<script lang="ts" setup>
import { projects, project as projectData } from '~/utils/atelier'
const props = defineProps<{ index: number }>()
const emit = defineEmits<{ (e: 'go', index: number): void }>()
const p = computed(() => projects[props.index])
const prev = computed(() => (props.index + projects.length - 1) % projects.length)
const next = computed(() => (props.index + 1) % projects.length)
const linkLabel = (url: string) => /youtu\.?be/.test(url) ? 'Watch demo' : 'Live preview'
</script>
<template>
  <article v-if="p" class="pp">
    <p class="eyebrow">Exhibit {{ String(index + 1).padStart(2, '0') }} <span class="sep">/</span> {{ projectData.title }}</p>
    <h2 id="panel-title" tabindex="-1" class="ptitle">{{ p.title }}</h2>
    <p class="lede">{{ p.description }}</p>
    <figure class="shot">
      <img :src="p.imageSrc" :alt="`Screenshot of ${p.title}`" loading="lazy" decoding="async" />
    </figure>
    <div v-if="p.codeLink || p.liveLink" class="links">
      <a v-if="p.liveLink" :href="p.liveLink" target="_blank" rel="noopener" class="btn btn-primary">
        <Icon :name="/youtu\.?be/.test(p.liveLink) ? 'play' : 'arrow-up-right'" :size="16" />{{ linkLabel(p.liveLink) }}
      </a>
      <a v-if="p.codeLink" :href="p.codeLink" target="_blank" rel="noopener" class="btn btn-ghost">
        <Icon name="code" :size="16" />Source code
      </a>
    </div>
    <p v-else class="note">Private project — no public demo or repository.</p>
    <nav class="pager" aria-label="Other exhibits">
      <button type="button" @click="emit('go', prev)"><Icon name="arrow-left" :size="14" /><span><small>Previous</small>{{ projects[prev].title }}</span></button>
      <button type="button" class="nx" @click="emit('go', next)"><span><small>Next</small>{{ projects[next].title }}</span><Icon name="arrow-right" :size="14" /></button>
    </nav>
  </article>
</template>
<style scoped>
.sep { color: rgba(138, 150, 158, 0.6); margin: 0 6px; }
.ptitle { font-family: var(--font-display); font-weight: 600; font-size: clamp(2rem, 2.6vw, 2.6rem); line-height: 1.05; letter-spacing: -0.015em; margin-top: 14px; }
.lede { margin-top: 16px; font-size: 1.0625rem; line-height: 1.65; color: var(--mist); }
.shot { margin-top: 24px; border-radius: 12px; overflow: hidden; border: 1px solid var(--panel-border); background: #0b0e12; }
.shot img { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; object-position: top; }
.links { margin-top: 24px; display: flex; flex-wrap: wrap; gap: 10px; }
.note { margin-top: 20px; font-size: 0.875rem; color: var(--titanium); }
.pager { margin-top: 36px; padding-top: 16px; border-top: 1px solid var(--hairline); display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.pager button { display: flex; align-items: center; gap: 10px; text-align: left; color: var(--porcelain); font-size: 0.9rem; min-height: 52px; padding: 6px 4px; border-radius: 8px; }
.pager button:hover { color: #fff; }
.pager button:hover small { color: var(--ice-cyan); }
.pager .nx { justify-content: flex-end; text-align: right; }
.pager small { display: block; font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--titanium); margin-bottom: 2px; }
</style>
