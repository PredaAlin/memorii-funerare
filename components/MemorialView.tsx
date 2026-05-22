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

  return (
    <div className="min-h-screen bg-white">
      {/* Cover */}
      <div className="h-56 w-full bg-stone-200 overflow-hidden relative">
        {coverPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPhoto} className="w-full h-full object-cover grayscale-[20%]" alt="Cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-16 relative z-10 pb-16">
        {/* Profile */}
        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl border-2 border-amber-100 overflow-hidden mb-4">
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
        <p className="text-stone-300 text-sm font-bold uppercase tracking-widest drop-shadow mb-8">
          {formatDate(memorial.birthDate)} &bull; {formatDate(memorial.deathDate)}
        </p>

        {/* Quote */}
        {memorial.quote && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-4 italic text-stone-700 text-sm leading-relaxed mb-8">
            &ldquo;{memorial.quote}&rdquo;
          </div>
        )}

        {/* Biography */}
        {memorial.bio && (
          <div className="mb-10">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 border-b border-stone-100 pb-2">Biografie</h2>
            <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{memorial.bio}</p>
          </div>
        )}

        {/* Gallery */}
        {memorial.mediaUrls.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 border-b border-stone-100 pb-2">Galerie</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {memorial.mediaUrls.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-stone-100">
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
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 border-b border-stone-100 pb-2">Videoclipuri</h2>
            <div className="space-y-4">
              {memorial.videoUrls.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-stone-900 shadow-lg">
                  <video src={url} controls className="w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer watermark */}
        <div className="mt-16 pt-8 border-t border-stone-100 flex items-center justify-center gap-2 opacity-40">
          <div className="w-4 h-4 bg-stone-800 rounded-sm rotate-45 flex items-center justify-center">
            <div className="w-2 h-2 border border-white rotate-[-45deg]"></div>
          </div>
          <span className="text-xs font-bold tracking-widest text-stone-500 serif">ETERNAL MEMORIES</span>
        </div>
      </div>
    </div>
  )
}
