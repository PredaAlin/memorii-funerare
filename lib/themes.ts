export type ThemeId =
  | 'clasic' | 'noapte' | 'natura' | 'serenitate' | 'vintage'
  | 'aurora' | 'smarald' | 'trandafir' | 'lavanda' | 'apus'

export interface MemorialTheme {
  id: ThemeId
  name: string
  colors: {
    bg: string
    surface: string
    surfaceAlt: string
    border: string
    borderAlt: string
    text: string
    textMuted: string
    coverOverlay: string
    profileRing: string
    tabActive: string
    tabInactive: string
    sectionHeading: string
  }
}

export const THEMES: MemorialTheme[] = [
  {
    id: 'clasic',
    name: 'Clasic',
    colors: {
      bg: '#ffffff',
      surface: '#f5f5f4',
      surfaceAlt: '#fffbeb',
      border: '#f5f5f4',
      borderAlt: '#fef3c7',
      text: '#44403c',
      textMuted: '#a8a29e',
      coverOverlay: 'linear-gradient(to top, rgba(28,25,23,0.70) 0%, rgba(28,25,23,0.20) 50%, transparent 100%)',
      profileRing: '#fef3c7',
      tabActive: '#1c1917',
      tabInactive: '#a8a29e',
      sectionHeading: '#a8a29e',
    },
  },
  {
    id: 'noapte',
    name: 'Noapte',
    colors: {
      bg: '#0f172a',
      surface: '#1e293b',
      surfaceAlt: 'rgba(251,191,36,0.10)',
      border: '#334155',
      borderAlt: 'rgba(251,191,36,0.20)',
      text: '#e2e8f0',
      textMuted: '#94a3b8',
      coverOverlay: 'linear-gradient(to top, rgba(15,23,42,0.90) 0%, rgba(15,23,42,0.35) 50%, transparent 100%)',
      profileRing: '#334155',
      tabActive: '#fbbf24',
      tabInactive: '#64748b',
      sectionHeading: '#64748b',
    },
  },
  {
    id: 'natura',
    name: 'Natură',
    colors: {
      bg: '#f7f5f0',
      surface: '#e8f0e9',
      surfaceAlt: '#d8ead9',
      border: '#c8ddc9',
      borderAlt: '#b8d4ba',
      text: '#2d4a3e',
      textMuted: '#6b8c7a',
      coverOverlay: 'linear-gradient(to top, rgba(26,58,40,0.75) 0%, rgba(26,58,40,0.25) 50%, transparent 100%)',
      profileRing: '#a5c8a8',
      tabActive: '#2d4a3e',
      tabInactive: '#88a48d',
      sectionHeading: '#6b8c7a',
    },
  },
  {
    id: 'serenitate',
    name: 'Serenitate',
    colors: {
      bg: '#f0f4ff',
      surface: '#e0e8f9',
      surfaceAlt: '#dce8fd',
      border: '#c7d5ef',
      borderAlt: '#b8ccee',
      text: '#1e3a5f',
      textMuted: '#6b8cb8',
      coverOverlay: 'linear-gradient(to top, rgba(15,32,64,0.80) 0%, rgba(15,32,64,0.25) 50%, transparent 100%)',
      profileRing: '#93b5d8',
      tabActive: '#1e3a5f',
      tabInactive: '#8499bb',
      sectionHeading: '#6b8cb8',
    },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    colors: {
      bg: '#fdf5e9',
      surface: '#f0e3c8',
      surfaceAlt: '#ede0c4',
      border: '#ddd0b0',
      borderAlt: '#d5c89e',
      text: '#3d2b1f',
      textMuted: '#8b6e5a',
      coverOverlay: 'linear-gradient(to top, rgba(40,20,12,0.75) 0%, rgba(40,20,12,0.25) 50%, transparent 100%)',
      profileRing: '#c9956b',
      tabActive: '#3d2b1f',
      tabInactive: '#a08060',
      sectionHeading: '#8b6e5a',
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    colors: {
      bg: '#0b1020',
      surface: '#161f38',
      surfaceAlt: 'rgba(94,234,212,0.08)',
      border: '#26304d',
      borderAlt: 'rgba(167,139,250,0.25)',
      text: '#e6ecf5',
      textMuted: '#8b9bc4',
      coverOverlay: 'linear-gradient(to top, rgba(11,16,32,0.92) 0%, rgba(11,16,32,0.35) 50%, transparent 100%)',
      profileRing: '#5eead4',
      tabActive: '#5eead4',
      tabInactive: '#5b6a93',
      sectionHeading: '#7c8bb8',
    },
  },
  {
    id: 'smarald',
    name: 'Smarald',
    colors: {
      bg: '#0a1f18',
      surface: '#123026',
      surfaceAlt: 'rgba(212,175,90,0.10)',
      border: '#1e4435',
      borderAlt: 'rgba(212,175,90,0.22)',
      text: '#e3efe8',
      textMuted: '#88ab9b',
      coverOverlay: 'linear-gradient(to top, rgba(10,31,24,0.92) 0%, rgba(10,31,24,0.35) 50%, transparent 100%)',
      profileRing: '#3f7a5f',
      tabActive: '#d4af5a',
      tabInactive: '#5f8675',
      sectionHeading: '#7ba491',
    },
  },
  {
    id: 'trandafir',
    name: 'Trandafir',
    colors: {
      bg: '#fdf2f4',
      surface: '#f9e3e8',
      surfaceAlt: '#fbe9ee',
      border: '#f1d0d8',
      borderAlt: '#e9bcc8',
      text: '#6b2737',
      textMuted: '#b07682',
      coverOverlay: 'linear-gradient(to top, rgba(74,20,33,0.75) 0%, rgba(74,20,33,0.25) 50%, transparent 100%)',
      profileRing: '#e8a9b8',
      tabActive: '#9d2f49',
      tabInactive: '#c08a96',
      sectionHeading: '#b07682',
    },
  },
  {
    id: 'lavanda',
    name: 'Lavandă',
    colors: {
      bg: '#f5f1fb',
      surface: '#ece4f7',
      surfaceAlt: '#efe7fb',
      border: '#ddd0ee',
      borderAlt: '#cdbbe4',
      text: '#3f2a5c',
      textMuted: '#8b76ab',
      coverOverlay: 'linear-gradient(to top, rgba(46,28,68,0.78) 0%, rgba(46,28,68,0.25) 50%, transparent 100%)',
      profileRing: '#bca7dd',
      tabActive: '#6b4d96',
      tabInactive: '#9d8bb8',
      sectionHeading: '#8b76ab',
    },
  },
  {
    id: 'apus',
    name: 'Apus',
    colors: {
      bg: '#fdf3ec',
      surface: '#fbe4d6',
      surfaceAlt: '#fce8da',
      border: '#f4d2bd',
      borderAlt: '#eebfa3',
      text: '#7a3520',
      textMuted: '#bd8064',
      coverOverlay: 'linear-gradient(to top, rgba(90,33,15,0.75) 0%, rgba(90,33,15,0.25) 50%, transparent 100%)',
      profileRing: '#eba274',
      tabActive: '#c2541f',
      tabInactive: '#cf9d83',
      sectionHeading: '#bd8064',
    },
  },
]

export const DEFAULT_THEME_ID: ThemeId = 'clasic'

export function getTheme(id: string | null | undefined): MemorialTheme {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}
