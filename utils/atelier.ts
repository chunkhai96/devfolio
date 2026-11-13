import * as landing from '~/data/landing'
import * as whatido from '~/data/whatido'
import * as project from '~/data/project'
import * as experience from '~/data/experience'
import * as talk from '~/data/talk'
import * as achievement from '~/data/achievement'
import * as contact from '~/data/contact'
import type { AtelierContent } from '~/three/screens'
import type { Interactable } from '~/three/engine'
import type { Zone } from '~/three/meta'

export { landing, whatido, project, experience, talk, achievement, contact }

const DEVICON_SVG: Record<string, string> = {
  'devicon-python-plain': 'python-plain',
  'devicon-typescript-plain': 'typescript-plain',
  'devicon-go-original-wordmark': 'go-original-wordmark',
  'devicon-scikitlearn-plain': 'scikitlearn-plain',
  'devicon-numpy-plain': 'numpy-plain',
  'devicon-azuresqldatabase-plain': 'azuresqldatabase-plain',
  'devicon-vuejs-plain': 'vuejs-plain',
  'devicon-kubernetes-plain': 'kubernetes-plain',
  'devicon-github-original': 'github-original',
  'devicon-linkedin-plain': 'linkedin-plain',
  'devicon-stackoverflow-plain': 'stackoverflow-plain',
  'devicon-googlecloud-plain': 'googlecloud-plain',
  'devicon-windows11-original': 'windows11-original',
}

export const iconUrl = (devicon?: string) =>
  devicon && DEVICON_SVG[devicon] ? `/atelier/icons/${DEVICON_SVG[devicon]}.svg` : undefined

/** Strip decorative emoji prefixes from authored copy for typographic display. */
export const clean = (s: string) => s.replace(/^[\p{Extended_Pictographic}️\s]+/u, '').trim()

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const projects = project.projectItems.map((p, i) => ({
  ...p, index: i, slug: slug(p.title), imageSrc: p.imageSrc.startsWith('/') ? p.imageSrc : '/' + p.imageSrc,
}))

export const achievements = achievement.achievementItems.map(a => ({
  ...a, imageSrc: a.imageSrc.startsWith('/') ? a.imageSrc : '/' + a.imageSrc,
}))

export const talks = talk.talkItems.map(t => ({
  ...t, imageSrc: t.imageSrc.startsWith('/') ? t.imageSrc : '/' + t.imageSrc,
}))

export const keyPoints = whatido.keyPoints.map(clean)

export function buildContent(): AtelierContent {
  return {
    galleryTitle: project.title,
    contact: { title: contact.title, email: contact.externalLinks.find(l => l.url.startsWith('mailto:'))?.url.replace('mailto:', '') ?? '' },
    projects: projects.map(p => ({ title: p.title, description: p.description, imageSrc: p.imageSrc })),
    roles: whatido.roles,
    keyPoints,
    tech: whatido.techStackItems.map(t => ({ text: t.text, svg: iconUrl(t.icon) })),
    experience: experience.timelineItems.map(e => ({ title: e.title, company: e.company, duration: e.duration })),
    achievements: achievements.map(a => ({ title: a.title, provider: a.provider, imageSrc: a.imageSrc })),
    talks: talks.map(t => ({ title: t.title, imageSrc: t.imageSrc })),
  }
}

/** Panel keys: what a content layer shows. Serialised into the URL hash. */
export type PanelKey =
  | { type: 'project', index: number }
  | { type: 'capabilities', focus?: number | 'stack' }
  | { type: 'experience', focus?: number }
  | { type: 'achievements', focus?: number }
  | { type: 'talks' }
  | { type: 'contact' }

export function buildInteractables(): Interactable[] {
  const list: Interactable[] = [
    { id: 'dest-gallery', hit: 'hit_dest_gallery', zone: 'atrium', label: 'Project Gallery', kind: 'destination', dest: 'gallery' },
    { id: 'dest-lab', hit: 'hit_dest_lab', zone: 'atrium', label: 'Engineering Lab', kind: 'destination', dest: 'lab' },
    { id: 'dest-corridor', hit: 'hit_dest_corridor', zone: 'atrium', label: 'Career Corridor', kind: 'destination', dest: 'corridor' },
    { id: 'hero', hit: 'hit_hero', zone: 'atrium', label: 'Kinetic Field', kind: 'feature' },
    { id: 'return-gallery', hit: 'hit_dest_gallery', zone: 'gallery', label: 'Atrium', kind: 'destination', dest: 'atrium' },
    { id: 'return-lab', hit: 'hit_dest_lab', zone: 'lab', label: 'Atrium', kind: 'destination', dest: 'atrium' },
    { id: 'return-corridor', hit: 'hit_dest_corridor', zone: 'corridor', label: 'Atrium', kind: 'destination', dest: 'atrium' },
    { id: 'dest-terrace', hit: 'hit_dest_terrace', zone: 'corridor', label: 'Connection Terrace', kind: 'destination', dest: 'terrace' },
    { id: 'return-terrace', hit: 'hit_dest_terrace', zone: 'terrace', label: 'Career Corridor', kind: 'destination', dest: 'corridor' },
    { id: 'contact', hit: 'hit_contact', zone: 'terrace', label: 'Get in touch', kind: 'exhibit', screen: 'screen_contact' },
    { id: 'stack', hit: 'hit_stack', zone: 'lab', label: 'Tools in daily use', kind: 'exhibit', screen: 'screen_stack' },
    { id: 'talk', hit: 'hit_talk', zone: 'lab', label: talks[0]?.title ?? 'Talks', kind: 'exhibit', screen: 'screen_talk' },
  ]
  projects.forEach((p, i) => list.push({ id: `project-${i}`, hit: `hit_project_${i}`, zone: 'gallery', label: p.title, kind: 'exhibit', screen: `screen_project_${i}` }))
  whatido.roles.forEach((r, i) => list.push({ id: `cap-${i}`, hit: `hit_cap_${i}`, zone: 'lab', label: r, kind: 'exhibit', screen: `screen_cap_${i}` }))
  const n = experience.timelineItems.length
  experience.timelineItems.forEach((_, niche) => {
    const item = experience.timelineItems[n - 1 - niche]
    list.push({ id: `role-${niche}`, hit: `hit_role_${niche}`, zone: 'corridor', label: item.title, kind: 'exhibit', screen: `screen_role_${niche}` })
  })
  achievements.forEach((a, k) => list.push({ id: `cert-${k}`, hit: `hit_cert_${k}`, zone: 'corridor', label: k === 1 ? `Certifications (${achievements.length})` : a.title, kind: 'exhibit', screen: `screen_cert_${k}`, marker: k === 1 }))
  return list
}

/** Which panel an interactable opens. Role niches are oldest-first; experience data is newest-first. */
export function panelFor(id: string): PanelKey | null {
  let m: RegExpMatchArray | null
  if ((m = id.match(/^project-(\d+)$/))) return { type: 'project', index: +m[1] }
  if ((m = id.match(/^cap-(\d+)$/))) return { type: 'capabilities', focus: +m[1] }
  if (id === 'stack') return { type: 'capabilities', focus: 'stack' }
  if (id === 'talk') return { type: 'talks' }
  if ((m = id.match(/^role-(\d+)$/))) return { type: 'experience', focus: experience.timelineItems.length - 1 - +m[1] }
  if ((m = id.match(/^cert-(\d+)$/))) return { type: 'achievements', focus: +m[1] }
  if (id === 'contact') return { type: 'contact' }
  return null
}

/** Exhibit to frame when a panel opens from the menu/room guide. */
export function exhibitFor(p: PanelKey): string {
  switch (p.type) {
    case 'project': return `project-${p.index}`
    case 'capabilities': return p.focus === 'stack' ? 'stack' : `cap-${p.focus ?? 0}`
    case 'experience': return `role-${experience.timelineItems.length - 1 - (p.focus ?? 0)}`
    case 'achievements': return `cert-${p.focus ?? 0}`
    case 'talks': return 'talk'
    case 'contact': return 'contact'
  }
}

export function zoneForPanel(p: PanelKey): Zone {
  switch (p.type) {
    case 'project': return 'gallery'
    case 'capabilities': case 'talks': return 'lab'
    case 'experience': case 'achievements': return 'corridor'
    case 'contact': return 'terrace'
  }
}

export function panelToHash(p: PanelKey | null, zone: Zone): string {
  if (!p) return zone === 'atrium' ? '' : `#${zone}`
  switch (p.type) {
    case 'project': return `#work/${projects[p.index]?.slug ?? p.index}`
    case 'capabilities': return p.focus === 'stack' ? '#capabilities/tools' : `#capabilities${p.focus !== undefined ? '/' + p.focus : ''}`
    case 'experience': return `#experience${p.focus !== undefined ? '/' + p.focus : ''}`
    case 'achievements': return `#achievements${p.focus !== undefined ? '/' + p.focus : ''}`
    case 'talks': return '#talks'
    case 'contact': return '#contact'
  }
}

export function hashToState(hash: string): { zone: Zone, panel: PanelKey | null } {
  const h = hash.replace(/^#/, '')
  const [a, b] = h.split('/')
  const num = (s?: string) => (s !== undefined && /^\d+$/.test(s) ? +s : undefined)
  switch (a) {
    case 'gallery': return { zone: 'gallery', panel: null }
    case 'lab': return { zone: 'lab', panel: null }
    case 'corridor': return { zone: 'corridor', panel: null }
    case 'terrace': return { zone: 'terrace', panel: null }
    case 'work': {
      const i = projects.findIndex(p => p.slug === b)
      return i >= 0 ? { zone: 'gallery', panel: { type: 'project', index: i } } : { zone: 'gallery', panel: null }
    }
    case 'capabilities': return { zone: 'lab', panel: { type: 'capabilities', focus: b === 'tools' ? 'stack' : num(b) } }
    case 'experience': return { zone: 'corridor', panel: { type: 'experience', focus: num(b) } }
    case 'achievements': return { zone: 'corridor', panel: { type: 'achievements', focus: num(b) } }
    case 'talks': return { zone: 'lab', panel: { type: 'talks' } }
    case 'contact': return { zone: 'terrace', panel: { type: 'contact' } }
    default: return { zone: 'atrium', panel: null }
  }
}
