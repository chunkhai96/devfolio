<script lang="ts" setup>
const props = defineProps<{ name: string, size?: number }>()
const PATHS: Record<string, string> = {
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-left': 'M19 12H5M11 18l-6-6 6-6',
  'arrow-up-right': 'M7 17L17 7M8 7h9v9',
  close: 'M6 6l12 12M18 6L6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  doc: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  play: 'M8 5v14l11-7z',
  slides: 'M3 4h18v12H3zM12 16v4M8 20h8',
  code: 'M9 8l-4 4 4 4M15 8l4 4-4 4',
  chevron: 'M9 6l6 6-6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  home: 'M4 11l8-7 8 7M6 10v10h12V10',
  check: 'M5 12l5 5 9-10',
}
</script>
<template>
  <svg :width="props.size ?? 18" :height="props.size ?? 18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path :d="PATHS[props.name]" />
  </svg>
</template>
