export type ThemeId = 'clasic' | 'noapte' | 'natura' | 'serenitate' | 'vintage'

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
]

export const DEFAULT_THEME_ID: ThemeId = 'clasic'

export function getTheme(id: string | null | undefined): MemorialTheme {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}
