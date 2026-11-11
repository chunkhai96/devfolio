<script lang="ts" setup>
import { landing } from '~/utils/atelier'
import { ZONE_META, type Zone } from '~/three/meta'

const props = defineProps<{ mode?: 'atelier' | 'document' }>()
const st = useAtelier()
const menuOpen = ref(false)
const menuBtn = ref<HTMLButtonElement>()
const items: { zone: Zone, label: string }[] = [
  { zone: 'gallery', label: 'Work' },
  { zone: 'lab', label: 'Capabilities' },
  { zone: 'corridor', label: 'Experience' },
  { zone: 'terrace', label: 'Contact' },
]

const SECTION: Record<Zone, string> = { atrium: 'doc-name', gallery: 'work', lab: 'capabilities', corridor: 'experience', terrace: 'contact' }

function go(z: Zone) {
  menuOpen.value = false
  if (props.mode === 'document' || st.webgl.value === 'none') {
    const el = document.getElementById(SECTION[z])
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    navigateTo({ path: '/', hash: z === 'atrium' ? '' : `#${z}` })
    return
  }
  st.goZone(z)
}

watch(menuOpen, (o) => {
  if (!o) nextTick(() => menuBtn.value?.focus())
})
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && menuOpen.value) menuOpen.value = false }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>
<template>
  <header class="site-header">
    <a href="/" class="wordmark" @click.prevent="go('atrium')">
      <span class="mono-mark" aria-hidden="true">AP</span>
      <span class="name">{{ landing.title }}<span class="sr-only">, return to the atrium</span></span>
    </a>
    <nav class="dock" aria-label="Primary">
      <button v-for="it in items" :key="it.zone" type="button" class="dock-item"
        :aria-current="mode !== 'document' && st.zone.value === it.zone ? 'location' : undefined" @click="go(it.zone)">
        <span class="idx" aria-hidden="true">{{ ZONE_META[it.zone].index }}</span>{{ it.label }}
      </button>
    </nav>
    <div class="aux">
      <a :href="landing.resumeSrc" target="_blank" rel="noopener" class="aux-link">Résumé <Icon name="arrow-up-right" :size="14" /></a>
      <NuxtLink v-if="mode !== 'document'" to="/overview" class="aux-link" title="All content as a standard page">Text view</NuxtLink>
      <NuxtLink v-else to="/" class="aux-link">3D atelier</NuxtLink>
      <button ref="menuBtn" type="button" class="menu-btn" :aria-expanded="menuOpen" aria-controls="site-menu" @click="menuOpen = !menuOpen">
        <Icon :name="menuOpen ? 'close' : 'menu'" :size="20" />
        <span class="sr-only">Menu</span>
      </button>
    </div>
    <Transition name="sheet">
      <div v-if="menuOpen" id="site-menu" class="menu-sheet" role="dialog" aria-label="Site menu">
        <button type="button" class="menu-item" @click="go('atrium')"><span class="idx">01</span>Atrium</button>
        <button v-for="it in items" :key="it.zone" type="button" class="menu-item" @click="go(it.zone)">
          <span class="idx">{{ ZONE_META[it.zone].index }}</span>{{ it.label }}
          <span class="room">{{ ZONE_META[it.zone].name }}</span>
        </button>
        <div class="menu-foot">
          <a :href="landing.resumeSrc" target="_blank" rel="noopener" class="btn btn-ghost">Résumé <Icon name="arrow-up-right" :size="14" /></a>
          <NuxtLink :to="mode === 'document' ? '/' : '/overview'" class="btn btn-ghost" @click="menuOpen = false">{{ mode === 'document' ? '3D atelier' : 'Text view' }}</NuxtLink>
        </div>
      </div>
    </Transition>
  </header>
</template>
<style scoped>
.site-header {
  position: fixed; inset: 0 0 auto 0; z-index: 40; height: 72px;
  display: flex; align-items: center; gap: 24px; padding: 0 28px;
  pointer-events: none;
}
.site-header > * { pointer-events: auto; }
/* keeps the wordmark legible over bright parts of the scene (oculus, skylight) */
.site-header::before {
  content: ''; position: absolute; inset: 0 0 -36px 0; pointer-events: none; z-index: -1;
  background: linear-gradient(180deg, rgba(10, 13, 17, 0.86) 0%, rgba(10, 13, 17, 0.6) 55%, rgba(10, 13, 17, 0) 100%);
}
.wordmark { display: inline-flex; align-items: center; gap: 12px; color: var(--porcelain); text-shadow: 0 1px 12px rgba(0, 0, 0, 0.55); }
.mono-mark { background: rgba(10, 13, 17, 0.55); }
.mono-mark {
  display: inline-grid; place-items: center; width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid rgba(215, 223, 223, 0.3); font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.06em;
}
.name { font-family: var(--font-display); font-weight: 600; font-size: 1.02rem; letter-spacing: 0.01em; }
.dock {
  margin-left: auto; display: flex; gap: 2px; padding: 4px; border-radius: 12px;
  background: rgba(16, 20, 25, 0.55); border: 1px solid var(--hairline);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
}
.dock-item {
  display: inline-flex; align-items: baseline; gap: 8px; height: 36px; padding: 0 14px; border-radius: 8px;
  font-size: 0.875rem; font-weight: 500; color: var(--mist); transition: color 180ms, background-color 180ms;
}
.dock-item:hover { color: #fff; background: rgba(215, 223, 223, 0.06); }
.dock-item[aria-current] { color: #fff; background: rgba(154, 216, 214, 0.1); box-shadow: inset 0 0 0 1px rgba(154, 216, 214, 0.35); }
.idx { font-family: var(--font-mono); font-size: 0.68rem; color: var(--titanium); letter-spacing: 0.04em; }
.dock-item[aria-current] .idx { color: var(--ice-cyan); }
.aux { display: flex; align-items: center; gap: 4px; }
.aux-link {
  display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px; border-radius: 8px;
  font-size: 0.875rem; color: var(--mist); transition: color 180ms;
}
.aux-link:hover { color: #fff; }
.menu-btn { display: none; width: 44px; height: 44px; border-radius: 10px; color: var(--porcelain); border: 1px solid var(--hairline); background: rgba(16, 20, 25, 0.6); place-items: center; }
.menu-sheet {
  position: fixed; top: 72px; right: 16px; left: 16px; max-width: 420px; margin-left: auto;
  background: var(--panel); border: 1px solid var(--panel-border); border-radius: 14px; padding: 8px;
  display: flex; flex-direction: column; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}
.menu-item {
  display: flex; align-items: baseline; gap: 12px; min-height: 52px; padding: 14px 14px; border-radius: 10px;
  font-family: var(--font-display); font-size: 1.2rem; font-weight: 500; color: var(--porcelain); text-align: left;
}
.menu-item:hover { background: rgba(215, 223, 223, 0.05); }
.room { margin-left: auto; font-family: var(--font-mono); font-size: 0.7rem; color: var(--titanium); letter-spacing: 0.08em; text-transform: uppercase; }
.menu-foot { display: flex; gap: 8px; padding: 10px 6px 6px; border-top: 1px solid var(--hairline); margin-top: 6px; }
.menu-foot .btn { flex: 1; }
.sheet-enter-active, .sheet-leave-active { transition: opacity 220ms var(--ease-out), transform 260ms var(--ease-out); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; transform: translateY(-6px); }
@media (max-width: 1080px) {
  .dock, .aux-link { display: none; }
  .menu-btn { display: inline-grid; }
  .aux { margin-left: auto; }
}
@media (max-width: 640px) {
  .site-header { padding: 0 16px; height: 64px; }
  .menu-sheet { top: 64px; }
}
</style>
