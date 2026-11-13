<script lang="ts" setup>
import { achievements, achievement } from '~/utils/atelier'
const props = defineProps<{ focus?: number }>()
const items = ref<HTMLElement[]>([])
watch(() => props.focus, (f) => {
  if (f !== undefined) nextTick(() => items.value[f]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
}, { immediate: true })
</script>
<template>
  <article>
    <p class="eyebrow">04 <span class="sep">/</span> Career Corridor</p>
    <h2 id="panel-title" tabindex="-1" class="ptitle">{{ achievement.title }}</h2>
    <ul class="certs">
      <li v-for="(a, i) in achievements" :key="a.title" ref="items" :class="{ on: focus === i }">
        <a :href="a.link" target="_blank" rel="noopener">
          <span class="logo"><img :src="a.imageSrc" :alt="`${a.provider} logo`" loading="lazy" decoding="async" /></span>
          <span class="txt">
            <span class="t">{{ a.title }}</span>
            <span class="p">{{ a.provider }}</span>
          </span>
          <Icon name="arrow-up-right" :size="15" class="go" />
        </a>
      </li>
    </ul>
  </article>
</template>
<style scoped>
.sep { color: rgba(138, 150, 158, 0.6); margin: 0 6px; }
.ptitle { font-family: var(--font-display); font-weight: 600; font-size: clamp(2rem, 2.6vw, 2.6rem); line-height: 1.05; letter-spacing: -0.015em; margin-top: 14px; }
.certs { margin-top: 26px; display: grid; gap: 8px; }
.certs a {
  display: grid; grid-template-columns: 76px 1fr 18px; align-items: center; gap: 14px;
  padding: 10px 12px 10px 10px; border: 1px solid var(--hairline); border-radius: 12px; color: var(--porcelain);
  transition: border-color 180ms, background-color 180ms; scroll-margin: 24px;
}
.certs a:hover { border-color: rgba(154, 216, 214, 0.5); background: rgba(215, 223, 223, 0.03); }
.certs li.on a { border-color: rgba(154, 216, 214, 0.6); }
.logo { display: grid; place-items: center; height: 52px; border-radius: 8px; background: #ece9e1; padding: 6px 8px; }
.logo img { max-width: 100%; max-height: 40px; object-fit: contain; }
.t { display: block; font-weight: 550; font-size: 0.975rem; line-height: 1.35; }
.p { display: block; margin-top: 3px; font-size: 0.8125rem; color: var(--titanium); }
.go { color: var(--titanium); }
.certs a:hover .go { color: var(--ice-cyan); }
</style>
