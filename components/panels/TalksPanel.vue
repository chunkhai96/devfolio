<script lang="ts" setup>
import { talks, talk } from '~/utils/atelier'
</script>
<template>
  <article>
    <p class="eyebrow">03 <span class="sep">/</span> Engineering Lab</p>
    <h2 id="panel-title" tabindex="-1" class="ptitle">{{ talk.title }}</h2>
    <div v-for="t in talks" :key="t.title" class="talk">
      <figure class="shot"><img :src="t.imageSrc" :alt="t.title" loading="lazy" decoding="async" /></figure>
      <h3>{{ t.title }}</h3>
      <div class="links">
        <a v-if="t.youtube" :href="t.youtube" target="_blank" rel="noopener" class="btn btn-primary"><Icon name="play" :size="16" />Watch on YouTube</a>
        <a v-if="t.slide" :href="t.slide" target="_blank" rel="noopener" class="btn btn-ghost"><Icon name="slides" :size="16" />Slides</a>
      </div>
    </div>
  </article>
</template>
<style scoped>
.sep { color: rgba(138, 150, 158, 0.6); margin: 0 6px; }
.ptitle { font-family: var(--font-display); font-weight: 600; font-size: clamp(2rem, 2.6vw, 2.6rem); line-height: 1.05; letter-spacing: -0.015em; margin-top: 14px; }
.talk { margin-top: 24px; }
.shot { border-radius: 12px; overflow: hidden; border: 1px solid var(--panel-border); }
.shot img { display: block; width: 100%; height: auto; }
h3 { margin-top: 18px; font-family: var(--font-display); font-size: 1.35rem; font-weight: 600; line-height: 1.25; }
.links { margin-top: 18px; display: flex; flex-wrap: wrap; gap: 10px; }
</style>
