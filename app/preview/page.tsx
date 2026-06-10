'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { MemorialView } from '@/components/MemorialView'

function PreviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { cart } = useCart()

  const id = searchParams.get('id')
  const item = cart.find(i => i.id === id)

  if (!item) {
    router.replace('/cart')
    return null
  }

  const { memorialData: d } = item

  return (
    <div>
      {/* Sticky action bar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-200 px-6 py-3 flex gap-3 justify-center">
        <Link
          href="/cart"
          className="px-5 py-2 border-2 border-stone-200 text-stone-600 rounded-full font-bold hover:bg-stone-50 transition-all flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Înapoi la coș
        </Link>
        <button
          onClick={() => router.push(`/editor?id=${id}`)}
          className="px-5 py-2 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          Continuă să editezi
        </button>
      </div>

      <MemorialView memorial={{
        id: d.id,
        deceasedName: d.deceasedName,
        birthDate: d.birthDate || null,
        deathDate: d.deathDate || null,
        bio: d.bio || null,
        quote: d.quote || null,
        mediaUrls: d.media,
        videoUrls: d.videos,
        profilePhotoUrl: d.profilePhoto || null,
        bannerPhotoUrl: d.bannerPhoto || null,
        theme: d.theme,
      }} />
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense>
      <PreviewContent />
    </Suspense>
  )
}
