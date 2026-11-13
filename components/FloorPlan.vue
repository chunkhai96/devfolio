<script lang="ts" setup>
import { ZONE_META, type Zone } from '~/three/meta'
const st = useAtelier()
// plan rectangles in Blender plan coordinates (x east, y north), drawn north-up
const ROOMS: { zone: Zone, x0: number, x1: number, y0: number, y1: number }[] = [
  { zone: 'atrium', x0: -9, x1: 9, y0: -9, y1: 9 },
  { zone: 'gallery', x0: 9.6, x1: 34, y0: -6, y1: 6 },
  { zone: 'lab', x0: -26, x1: -9.6, y0: -7, y1: 7 },
  { zone: 'corridor', x0: -3.5, x1: 3.5, y0: 9.6, y1: 34 },
  { zone: 'terrace', x0: -12, x1: 12, y0: 34, y1: 47 },
]
</script>
<template>
  <svg class="plan" viewBox="-28 -49 64 60" role="group" aria-label="Floor plan">
    <g v-for="r in ROOMS" :key="r.zone">
      <rect :x="r.x0" :y="-r.y1" :width="r.x1 - r.x0" :height="r.y1 - r.y0" rx="0.6"
        class="room" :class="{ on: st.zone.value === r.zone, open: r.zone === 'terrace' }"
        tabindex="-1" @click="st.goZone(r.zone)">
        <title>{{ ZONE_META[r.zone].name }}</title>
      </rect>
    </g>
    <circle cx="0" cy="0" r="2.4" class="plinth" />
    <g class="doors">
      <line x1="9.3" y1="-2.25" x2="9.3" y2="2.25" />
      <line x1="-9.3" y1="-2.25" x2="-9.3" y2="2.25" />
      <line x1="-2.25" y1="-9.3" x2="2.25" y2="-9.3" />
      <line x1="-3.5" y1="-34" x2="3.5" y2="-34" />
    </g>
  </svg>
</template>
<style scoped>
.plan { width: 100%; height: auto; display: block; overflow: visible; }
.room { fill: rgba(215, 223, 223, 0.02); stroke: rgba(138, 150, 158, 0.55); stroke-width: 0.35; cursor: pointer; transition: fill 200ms, stroke 200ms; }
.room.open { stroke-dasharray: 1.2 0.8; }
.room:hover { fill: rgba(215, 223, 223, 0.07); }
.room.on { fill: rgba(154, 216, 214, 0.14); stroke: var(--ice-cyan); stroke-width: 0.5; }
.plinth { fill: none; stroke: rgba(138, 150, 158, 0.5); stroke-width: 0.3; pointer-events: none; }
.doors line { stroke: var(--ink); stroke-width: 0.9; pointer-events: none; }
</style>
