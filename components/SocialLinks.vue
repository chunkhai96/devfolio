<script lang="ts" setup>
import { contact, iconUrl } from '~/utils/atelier'
defineProps<{ size?: 'sm' | 'md', labels?: boolean }>()
</script>
<template>
  <ul class="social" :class="[size ?? 'md', { labelled: labels }]">
    <li v-for="link in contact.externalLinks" :key="link.url">
      <a :href="link.url" target="_blank" rel="noopener" :aria-label="labels ? undefined : link.label" :title="link.label">
        <img v-if="iconUrl(link.devicon)" class="glyph-img glyph" :src="iconUrl(link.devicon)" alt="" aria-hidden="true" />
        <Icon v-else name="mail" :size="size === 'sm' ? 16 : 18" />
        <span v-if="labels" class="lbl">{{ link.label }}</span>
      </a>
    </li>
  </ul>
</template>
<style scoped>
.social { display: flex; flex-wrap: wrap; gap: 6px; }
.social a {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  min-width: 40px; height: 40px; border-radius: 10px; color: var(--mist);
  border: 1px solid transparent; transition: color 180ms var(--ease-out), border-color 180ms var(--ease-out), background-color 180ms;
}
.social a:hover { color: #fff; border-color: rgba(154, 216, 214, 0.5); background: rgba(16, 20, 25, 0.5); }
.glyph { width: 18px; height: 18px; }
.sm .glyph { width: 16px; height: 16px; }
.labelled { flex-direction: column; gap: 2px; }
.labelled a { justify-content: flex-start; padding: 0 12px; width: 100%; height: 44px; border-color: var(--hairline); }
.lbl { font-size: 0.9375rem; color: var(--porcelain); }
@media (pointer: coarse) { .social a { min-width: 44px; height: 44px; } }
</style>
