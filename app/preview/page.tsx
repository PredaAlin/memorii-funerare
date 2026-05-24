'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { MemorialPreview } from '@/components/MemorialPreview'

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

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center">
      <div className="mb-8 flex gap-4">
        <Link
          href="/cart"
          className="px-6 py-2 border-2 border-stone-200 text-stone-600 rounded-full font-bold hover:bg-stone-50 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Înapoi la coș
        </Link>
        <button
          onClick={() => router.push(`/editor?id=${id}`)}
          className="px-6 py-2 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          Continuă să editezi
        </button>
      </div>
      <MemorialPreview data={item.memorialData} />
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
