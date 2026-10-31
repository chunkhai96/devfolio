import type { Zone } from '~/three/meta'
import type { PanelKey } from '~/utils/atelier'

type EngineHandle = {
  goZone: (z: Zone, instant?: boolean) => Promise<void>
  focus: (id: string, instant?: boolean) => Promise<void>
  unfocus: () => Promise<void>
  activate: (id: string) => void
  setFocus: (id: string | null) => void
  setPanelOpen: (open: boolean) => void
  setInset: (right: number, bottom: number) => void
  setReducedMotion: (v: boolean) => void
}

/**
 * Shared experience state. The 3D engine is optional: every action degrades to
 * plain content navigation when WebGL is unavailable or still loading.
 */
export function useAtelier() {
  const zone = useState<Zone>('atelier-zone', () => 'atrium')
  const panel = useState<PanelKey | null>('atelier-panel', () => null)
  const ready = useState<boolean>('atelier-ready', () => false)
  const progress = useState<number>('atelier-progress', () => 0)
  const webgl = useState<'unknown' | 'ok' | 'none'>('atelier-webgl', () => 'unknown')
  const moving = useState<boolean>('atelier-moving', () => false)
  const hovered = useState<string | null>('atelier-hover', () => null)
  const exploring = useState<boolean>('atelier-exploring', () => false)
  const reducedMotion = useState<boolean>('atelier-rm', () => false)
  const toast = useState<string | null>('atelier-toast', () => null)
  const engine = useState<EngineHandle | null>('atelier-engine', () => null)

  const syncHash = (push: boolean) => {
    if (!import.meta.client) return
    const h = panelToHash(panel.value, zone.value)
    const url = location.pathname + location.search + h
    if (url === location.pathname + location.search + location.hash) return
    if (push) history.pushState({ atelier: true }, '', url)
    else history.replaceState({ atelier: true }, '', url)
  }

  async function goZone(z: Zone, opts: { push?: boolean, instant?: boolean } = {}) {
    panel.value = null
    engine.value?.setPanelOpen(false)
    zone.value = z
    if (z !== 'atrium') exploring.value = true
    syncHash(opts.push ?? true)
    await engine.value?.goZone(z, opts.instant)
  }

  async function openPanel(p: PanelKey, opts: { push?: boolean, instant?: boolean, fromExhibit?: string } = {}) {
    panel.value = p
    zone.value = zoneForPanel(p)
    exploring.value = true
    engine.value?.setPanelOpen(true)
    syncHash(opts.push ?? true)
    await engine.value?.focus(opts.fromExhibit ?? exhibitFor(p), opts.instant)
  }

  async function closePanel(opts: { push?: boolean } = {}) {
    if (!panel.value) return
    panel.value = null
    engine.value?.setPanelOpen(false)
    syncHash(opts.push ?? false)
    await engine.value?.unfocus()
  }

  function showToast(msg: string, ms = 5200) {
    toast.value = msg
    if (import.meta.client) setTimeout(() => { if (toast.value === msg) toast.value = null }, ms)
  }

  return {
    zone, panel, ready, progress, webgl, moving, hovered, exploring, reducedMotion, toast, engine,
    goZone, openPanel, closePanel, showToast, syncHash,
  }
}
