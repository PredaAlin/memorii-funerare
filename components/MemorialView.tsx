import { getTheme } from '@/lib/themes'

interface MemorialData {
  deceasedName: string
  birthDate: string | null
  deathDate: string | null
  bio: string | null
  quote: string | null
  mediaUrls: string[]
  videoUrls: string[]
  profilePhotoUrl?: string | null
  bannerPhotoUrl?: string | null
  theme?: string | null
  id: string
}

interface MemorialViewProps {
  memorial: MemorialData
}

function formatDate(dateString: string | null) {
  if (!dateString) return '...'
  return new Date(dateString).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function MemorialView({ memorial }: MemorialViewProps) {
  const coverPhoto = memorial.bannerPhotoUrl || memorial.mediaUrls[0]
  const profilePhoto = memorial.profilePhotoUrl || memorial.mediaUrls[0]
  const theme = getTheme(memorial.theme)
  const c = theme.colors

  return (
    <div className="min-h-screen" style={{ background: c.bg }}>
      {/* Cover */}
      <div className="h-56 w-full overflow-hidden relative" style={{ background: '#c8c8c8' }}>
        {coverPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPhoto} className="w-full h-full object-cover grayscale-[20%]" alt="Cover" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #b0b0b0 0%, #888 100%)' }} />
        )}
        <div className="absolute inset-0" style={{ background: c.coverOverlay }} />
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-16 relative z-10 pb-16">
        {/* Profile */}
        <div
          className="w-24 h-24 rounded-full p-1 shadow-xl border-2 overflow-hidden mb-4"
          style={{ background: c.bg, borderColor: c.profileRing }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profilePhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop'}
            className="w-full h-full object-cover rounded-full"
            alt={memorial.deceasedName}
          />
        </div>

        <h1 className="text-3xl font-bold serif text-white drop-shadow-lg uppercase tracking-widest mb-1">
          {memorial.deceasedName}
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest drop-shadow mb-8" style={{ color: '#d6d3d1' }}>
          {formatDate(memorial.birthDate)} &bull; {formatDate(memorial.deathDate)}
        </p>

        {/* Quote */}
        {memorial.quote && (
          <div
            className="rounded-2xl px-6 py-4 italic text-sm leading-relaxed mb-8"
            style={{ background: c.surfaceAlt, border: `1px solid ${c.borderAlt}`, color: c.text }}
          >
            &ldquo;{memorial.quote}&rdquo;
          </div>
        )}

        {/* Biography */}
        {memorial.bio && (
          <div className="mb-10">
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-3 pb-2"
              style={{ color: c.sectionHeading, borderBottom: `1px solid ${c.border}` }}
            >
              Biografie
            </h2>
            <p className="leading-relaxed whitespace-pre-wrap" style={{ color: c.text }}>{memorial.bio}</p>
          </div>
        )}

        {/* Gallery */}
        {memorial.mediaUrls.length > 0 && (
          <div className="mb-10">
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-3 pb-2"
              style={{ color: c.sectionHeading, borderBottom: `1px solid ${c.border}` }}
            >
              Galerie
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {memorial.mediaUrls.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden" style={{ background: c.surface }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {memorial.videoUrls.length > 0 && (
          <div>
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-3 pb-2"
              style={{ color: c.sectionHeading, borderBottom: `1px solid ${c.border}` }}
            >
              Videoclipuri
            </h2>
            <div className="space-y-4">
              {memorial.videoUrls.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden shadow-lg" style={{ background: '#111' }}>
                  <video src={url} controls className="w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer watermark */}
        <div className="mt-16 pt-8 flex items-center justify-center gap-2 opacity-40" style={{ borderTop: `1px solid ${c.border}` }}>
          <div className="w-4 h-4 rounded-sm rotate-45 flex items-center justify-center" style={{ background: c.text }}>
            <div className="w-2 h-2 border border-white rotate-[-45deg]"></div>
          </div>
          <span className="text-xs font-bold tracking-widest serif" style={{ color: c.textMuted }}>ETERNAL MEMORIES</span>
        </div>
      </div>
    </div>
  )
}
