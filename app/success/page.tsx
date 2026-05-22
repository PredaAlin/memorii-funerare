'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

function SuccessContent() {
  const searchParams = useSearchParams()
  const { shippingInfo, clearCart } = useCart()
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    // Only clear once to avoid clearing on subsequent renders
    if (!cleared) {
      clearCart()
      setCleared(true)
    }
  }, [cleared, clearCart])

  const sessionId = searchParams.get('session_id')

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <h2 className="text-4xl font-bold mb-4 serif text-stone-800">Moștenire Asigurată</h2>
      <p className="text-stone-600 text-lg mb-4">
        {shippingInfo.fullName
          ? <>Mulțumim, <strong>{shippingInfo.fullName}</strong>. Plăcile tale personalizate sunt acum în curs de inscripționare.</>
          : 'Îți mulțumim pentru comandă. Plăcile tale personalizate sunt acum în curs de inscripționare.'
        }
      </p>
      {shippingInfo.email && (
        <p className="text-stone-500 mb-12">Un link de urmărire va fi trimis la <strong>{shippingInfo.email}</strong>.</p>
      )}
      <div className="flex gap-4 justify-center">
        <Link
          href="/dashboard"
          className="px-10 py-4 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all"
        >
          Vezi Memoriile mele
        </Link>
        <Link href="/" className="px-10 py-4 border-2 border-stone-200 text-stone-700 rounded-full font-bold hover:bg-stone-50 transition-all">
          Înapoi Acasă
        </Link>
      </div>
      {sessionId && (
        <p className="mt-8 text-xs text-stone-400 font-mono">Ref. comandă: {sessionId}</p>
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
