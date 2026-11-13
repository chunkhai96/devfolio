/** Zone identity, kept free of three.js so the UI shell never pulls the renderer into its bundle. */
export type Zone = 'atrium' | 'gallery' | 'lab' | 'corridor' | 'terrace'

export const ZONES: Zone[] = ['atrium', 'gallery', 'lab', 'corridor', 'terrace']

export const ZONE_META: Record<Zone, { index: string, name: string, short: string }> = {
  atrium: { index: '01', name: 'Arrival Atrium', short: 'Atrium' },
  gallery: { index: '02', name: 'Project Gallery', short: 'Work' },
  lab: { index: '03', name: 'Engineering Lab', short: 'Capabilities' },
  corridor: { index: '04', name: 'Career Corridor', short: 'Experience' },
  terrace: { index: '05', name: 'Connection Terrace', short: 'Contact' },
}
