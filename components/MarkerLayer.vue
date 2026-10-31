<script lang="ts" setup>
import type { Interactable } from '~/three/engine'
const props = defineProps<{ items: Interactable[] }>()
const emit = defineEmits<{ (e: 'ready', map: Map<string, HTMLElement>): void }>()
const st = useAtelier()
const root = ref<HTMLElement>()
const visible = computed(() => props.items.filter(i => i.kind !== 'feature' && i.marker !== false))

onMounted(() => {
  const map = new Map<string, HTMLElement>()
  root.value?.querySelectorAll<HTMLElement>('[data-marker]').forEach(el => map.set(el.dataset.marker!, el))
  emit('ready', map)
})

function idx(it: Interactable) {
  const m = it.id.match(/-(\d+)$/)
  return m ? String(+m[1] + 1).padStart(2, '0') : ''
}
</script>
<template>
  <div ref="root" class="markers" :class="{ 'is-hidden': !st.exploring.value && st.zone.value === 'atrium' }" role="group" aria-label="Points of interest in view">
    <button v-for="it in visible" :key="it.id" type="button" class="marker" :class="it.kind" :data-marker="it.id"
      tabindex="-1" aria-hidden="true" style="opacity: 0"
      :aria-label="it.kind === 'destination' ? `Go to ${it.label}` : `Open ${it.label}`"
      @click="st.engine.value?.activate(it.id)"
      @mouseenter="st.engine.value?.setFocus(it.id)" @mouseleave="st.engine.value?.setFocus(null)"
      @focus="st.engine.value?.setFocus(it.id)" @blur="st.engine.value?.setFocus(null)">
      <span class="pin" aria-hidden="true"><span class="pin-ring" /><span class="core" /></span>
      <span class="tag">
        <span v-if="it.kind === 'exhibit' && idx(it) && !it.id.startsWith('cert')" class="num">{{ idx(it) }}</span>
        <span class="txt">{{ it.label }}</span>
        <Icon v-if="it.kind === 'destination'" :name="it.dest === 'atrium' ? 'arrow-left' : 'arrow-right'" :size="13" />
      </span>
    </button>
  </div>
</template>
<style scoped>
.markers { position: absolute; inset: 0; pointer-events: none; z-index: 15; overflow: hidden; transition: opacity 300ms; }
.markers.is-hidden { opacity: 0; }
.markers.is-hidden .marker { pointer-events: none !important; }
.marker {
  position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 10px;
  transition: opacity 250ms var(--ease-out); will-change: transform; padding: 0;
}
.pin { position: relative; width: 22px; height: 22px; margin-left: -11px; margin-top: -11px; flex: none; }
.pin-ring { position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid #f2f0e9; background: rgba(16, 20, 25, 0.55); -webkit-appearance: none; transition: transform 200ms var(--ease-out), border-color 200ms; }
.core { position: absolute; inset: 7px; border-radius: 50%; background: var(--porcelain); transition: background-color 200ms, inset 200ms var(--ease-out); }
.tag {
  margin-top: -11px; display: inline-flex; align-items: center; gap: 8px; height: 30px; padding: 0 12px;
  border-radius: 8px; background: rgba(14, 18, 23, 0.88); border: 1px solid var(--panel-border);
  font-size: 0.8125rem; font-weight: 500; color: var(--porcelain); white-space: nowrap;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  transition: opacity 200ms var(--ease-out), transform 220ms var(--ease-out), border-color 200ms;
}
.num { font-family: var(--font-mono); font-size: 0.68rem; color: var(--titanium); }
.exhibit .tag { opacity: 0; transform: translateX(-4px); pointer-events: none; }
.marker[data-hover='1'] .tag, .marker:focus-visible .tag { opacity: 1; transform: none; border-color: rgba(154, 216, 214, 0.6); }
.marker[data-hover='1'] .pin-ring, .marker:focus-visible .pin-ring { border-color: var(--ice-cyan); transform: scale(1.15); }
.marker[data-hover='1'] .core, .marker:focus-visible .core { background: var(--ice-cyan); inset: 6px; }
.marker:focus-visible, .marker:focus { outline: none; }
.marker { -webkit-tap-highlight-color: transparent; -webkit-appearance: none; appearance: none; background: none; border: 0; box-shadow: none; }
.exhibit .pin-ring { box-shadow: none; }
/* generous invisible hit area around the pin for touch */
.pin::before { content: ''; position: absolute; inset: -11px; border-radius: 50%; }
.marker[data-flip='1'] { flex-direction: row-reverse; transform-origin: right center; }
.marker[data-flip='1'] .pin { margin-left: 0; margin-right: -11px; }
.marker[data-flip='1'] { translate: -100% 0; }
.marker[data-flip='1'].exhibit .tag { transform: translateX(4px); }
.marker[data-flip='1'][data-hover='1'] .tag, .marker[data-flip='1']:focus-visible .tag { transform: none; }
.destination .pin-ring { animation: breathe 3.6s var(--ease-inout) infinite; }
@keyframes breathe { 0%, 100% { box-shadow: 0 0 0 0 rgba(242, 240, 233, 0); } 50% { box-shadow: 0 0 0 6px rgba(242, 240, 233, 0.1); } }
</style>
