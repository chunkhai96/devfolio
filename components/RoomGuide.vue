<script lang="ts" setup>
import { projects, whatido, experience, talks, achievements, landing } from '~/utils/atelier'
import type { PanelKey } from '~/utils/atelier'
import { ZONE_META, type Zone } from '~/three/meta'

const st = useAtelier()
interface Item { label: string, meta?: string, panel?: PanelKey, zone?: Zone, href?: string }

const GUIDE: Record<Zone, { blurb: string, items: Item[] }> = {
  atrium: {
    blurb: 'Choose a room, or select a doorway in the scene.',
    items: [
      { label: 'Project Gallery', meta: '02', zone: 'gallery' },
      { label: 'Engineering Lab', meta: '03', zone: 'lab' },
      { label: 'Career Corridor', meta: '04', zone: 'corridor' },
      { label: 'Connection Terrace', meta: '05', zone: 'terrace' },
    ],
  },
  gallery: {
    blurb: `${projects.length} personal projects — web platforms, a mobile app, and data & AI tools.`,
    items: projects.map((p, i) => ({ label: p.title, meta: String(i + 1).padStart(2, '0'), panel: { type: 'project', index: i } as PanelKey })),
  },
  lab: {
    blurb: 'What I do: three disciplines, the tools behind them, and a talk.',
    items: [
      ...whatido.roles.map((r, i) => ({ label: r, meta: String(i + 1).padStart(2, '0'), panel: { type: 'capabilities', focus: i } as PanelKey })),
      { label: 'Tools in daily use', meta: String(whatido.roles.length + 1).padStart(2, '0'), panel: { type: 'capabilities', focus: 'stack' } },
      ...(talks.length ? [{ label: talks.length === 1 ? 'Talk: ' + talks[0].title : 'Talks', meta: String(whatido.roles.length + 2).padStart(2, '0'), panel: { type: 'talks' } as PanelKey }] : []),
    ],
  },
  corridor: {
    blurb: `${experience.timelineItems.length} roles in chronological order, and ${achievements.length} certifications.`,
    items: [
      ...experience.timelineItems.map((e, i) => ({ label: e.title, meta: e.duration.split(' - ')[0].replace(/^\w+ /, ''), panel: { type: 'experience', focus: i } as PanelKey })),
      { label: `Certifications (${achievements.length})`, meta: '—', panel: { type: 'achievements' } },
    ],
  },
  terrace: {
    blurb: 'Questions, collaborations, or a chat — the door is open.',
    items: [
      { label: 'Get in touch', panel: { type: 'contact' } },
      { label: 'Résumé', href: landing.resumeSrc },
    ],
  },
}

const guide = computed(() => GUIDE[st.zone.value])
const titleEl = ref<HTMLElement>()
// entering a new room replaces the list; keep keyboard users anchored on the room heading
watch(() => st.zone.value, () => nextTick(() => {
  const a = document.activeElement
  if (!a || a === document.body || !a.isConnected) titleEl.value?.focus({ preventScroll: true })
}))
const collapsed = ref(false)

function pick(it: Item) {
  if (it.panel) st.openPanel(it.panel)
  else if (it.zone) st.goZone(it.zone)
}
</script>
<template>
  <section class="guide" :class="{ collapsed }" aria-label="Room guide">
    <div class="head">
      <div>
        <p class="eyebrow"><span class="cyan">{{ ZONE_META[st.zone.value].index }}</span> / 05</p>
        <h2 ref="titleEl" class="title" tabindex="-1">{{ ZONE_META[st.zone.value].name }}</h2>
      </div>
      <button type="button" class="guide-toggle" :aria-expanded="!collapsed" @click="collapsed = !collapsed">
        <Icon :name="collapsed ? 'list' : 'close'" :size="16" />
        <span class="sr-only">{{ collapsed ? 'Show room guide' : 'Hide room guide' }}</span>
      </button>
    </div>
    <div v-show="!collapsed" class="body">
      <FloorPlan class="plan" />
      <p class="blurb">{{ guide.blurb }}</p>
      <ul class="items">
        <li v-for="it in guide.items" :key="it.label">
          <a v-if="it.href" :href="it.href" target="_blank" rel="noopener" class="item">
            <span class="label">{{ it.label }}</span><Icon name="arrow-up-right" :size="14" />
          </a>
          <button v-else type="button" class="item" @click="pick(it)">
            <span v-if="it.meta" class="meta">{{ it.meta }}</span>
            <span class="label">{{ it.label }}</span>
            <Icon name="arrow-right" :size="14" />
          </button>
        </li>
      </ul>
      <button v-if="st.zone.value !== 'atrium'" type="button" class="back" @click="st.goZone('atrium')">
        <Icon name="arrow-left" :size="14" />Back to the atrium
      </button>
    </div>
  </section>
</template>
<style scoped>
.guide {
  position: absolute; left: 24px; bottom: 24px; z-index: 20; width: 300px;
  background: rgba(14, 18, 23, 0.985); border: 1px solid var(--panel-border); border-radius: 14px;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  padding: 16px 16px 14px; box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
}
.head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.cyan { color: var(--ice-cyan); }
.title:focus, .title:focus-visible { outline: none; }
.title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; margin-top: 4px; letter-spacing: -0.005em; }
.guide-toggle { width: 36px; height: 36px; border-radius: 9px; display: grid; place-items: center; color: var(--mist); border: 1px solid var(--hairline); }
.guide-toggle:hover { color: #fff; border-color: rgba(154, 216, 214, 0.45); }
@media (pointer: coarse) { .guide-toggle { width: 44px; height: 44px; } }
.plan { margin: 14px 0 4px; max-width: 200px; }
.blurb { margin-top: 10px; font-size: 0.875rem; line-height: 1.5; color: var(--mist); opacity: 0.86; }
.items { margin-top: 10px; border-top: 1px solid var(--hairline); }
.item {
  width: 100%; display: flex; align-items: center; gap: 12px; min-height: 40px; padding: 8px 4px;
  border-bottom: 1px solid var(--hairline); color: var(--porcelain); text-align: left; font-size: 0.9rem;
  transition: color 160ms, padding 200ms var(--ease-out);
}
.item:hover { color: #fff; padding-left: 8px; }
.item:hover .meta { color: var(--ice-cyan); }
.meta { font-family: var(--font-mono); font-size: 0.7rem; color: var(--titanium); min-width: 30px; }
.label { flex: 1; }
.back { margin-top: 12px; display: inline-flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--mist); min-height: 36px; }
.back:hover { color: #fff; }
.collapsed { width: auto; padding-bottom: 16px; }
@media (max-height: 760px) { .plan { display: none; } }
@media (max-width: 760px) {
  .guide { left: 12px; right: 12px; bottom: 12px; width: auto; padding: 12px 14px; }
  .plan { display: none; }
  .blurb { display: none; }
  /* phones: every item fully visible as a two-column grid, scrolling vertically if a room has many */
  .items { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; border-top: 0; margin-top: 10px; max-height: 34vh; overflow-y: auto; scrollbar-width: none; }
  .item { border: 1px solid var(--hairline); border-radius: 10px; padding: 8px 10px; min-height: 44px; font-size: 0.82rem; line-height: 1.25; }
  .item svg { display: none; }
  .item:hover { padding-left: 12px; }
}
</style>
