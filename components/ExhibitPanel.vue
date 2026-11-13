<script lang="ts" setup>
import ProjectPanel from './panels/ProjectPanel.vue'
import CapabilitiesPanel from './panels/CapabilitiesPanel.vue'
import ExperiencePanel from './panels/ExperiencePanel.vue'
import AchievementsPanel from './panels/AchievementsPanel.vue'
import TalksPanel from './panels/TalksPanel.vue'
import ContactPanel from './panels/ContactPanel.vue'

const st = useAtelier()
const root = ref<HTMLElement>()
const scroller = ref<HTMLElement>()
let returnFocus: HTMLElement | null = null

watch(() => st.panel.value, (p, old) => {
  if (p && !old) {
    returnFocus = document.activeElement as HTMLElement | null
    nextTick(() => root.value?.querySelector<HTMLElement>('#panel-title')?.focus({ preventScroll: true }))
  }
  if (p && old) nextTick(() => {
    if (p.type !== old.type || ('index' in p && 'index' in old && p.index !== old.index)) scroller.value?.scrollTo({ top: 0 })
  })
  if (!p && old) nextTick(() => returnFocus?.isConnected && returnFocus.focus({ preventScroll: true }))
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && st.panel.value) {
    e.preventDefault()
    st.closePanel()
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>
<template>
  <Transition name="panel">
    <div v-if="st.panel.value" ref="root" class="panel" role="dialog" aria-modal="false" aria-labelledby="panel-title">
      <div class="bar">
        <button type="button" class="close" @click="st.closePanel()">
          <Icon name="close" :size="18" /><span>Close</span><kbd aria-hidden="true">Esc</kbd>
        </button>
      </div>
      <div ref="scroller" class="scroll scroll-quiet" tabindex="0" role="region" aria-labelledby="panel-title">
        <ProjectPanel v-if="st.panel.value.type === 'project'" :index="st.panel.value.index" @go="i => st.openPanel({ type: 'project', index: i }, { push: false })" />
        <CapabilitiesPanel v-else-if="st.panel.value.type === 'capabilities'" :focus="st.panel.value.focus" />
        <ExperiencePanel v-else-if="st.panel.value.type === 'experience'" :focus="st.panel.value.focus" />
        <AchievementsPanel v-else-if="st.panel.value.type === 'achievements'" :focus="st.panel.value.focus" />
        <TalksPanel v-else-if="st.panel.value.type === 'talks'" />
        <ContactPanel v-else-if="st.panel.value.type === 'contact'" />
      </div>
    </div>
  </Transition>
</template>
<style scoped>
.panel {
  position: absolute; top: 84px; right: 16px; z-index: 30; max-height: calc(100% - 100px);
  width: min(560px, 42vw); display: flex; flex-direction: column;
  background: var(--panel); border: 1px solid var(--panel-border); border-radius: 16px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}
.bar { display: flex; justify-content: flex-end; padding: 12px 12px 0; }
.close {
  display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 10px 0 12px; border-radius: 10px;
  color: var(--mist); font-size: 0.875rem; border: 1px solid transparent;
}
.close:hover { color: #fff; border-color: var(--hairline); }
kbd { font-family: var(--font-mono); font-size: 0.66rem; padding: 2px 6px; border-radius: 5px; border: 1px solid var(--hairline); color: var(--titanium); }
.scroll {
  overflow-y: auto; padding: 4px 40px 40px; flex: 1; overscroll-behavior: contain;
  /* soft fade at the bottom edge signals more content below */
  -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 36px), transparent);
  mask-image: linear-gradient(to bottom, #000 calc(100% - 36px), transparent);
}
.scroll :deep(#panel-title):focus { outline: none; }
.scroll:focus-visible { outline: 2px solid var(--ice-cyan); outline-offset: -2px; border-radius: 0 0 16px 16px; }
.panel-enter-active, .panel-leave-active { transition: opacity 320ms var(--ease-out), transform 380ms var(--ease-out); }
.panel-enter-from, .panel-leave-to { opacity: 0; transform: translateX(24px); }
@media (max-width: 900px) {
  .panel { left: 0; right: 0; bottom: 0; top: auto; width: auto; height: 62vh; height: 62dvh; border-radius: 18px 18px 0 0; border-bottom: 0; }
  .scroll { padding: 0 20px 32px; }
  .panel-enter-from, .panel-leave-to { transform: translateY(32px); }
  kbd { display: none; }
}
</style>
