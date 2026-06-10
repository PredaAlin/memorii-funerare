'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export function SavedToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get('saved') === '1') {
      setVisible(true)
      router.replace('/dashboard', { scroll: false })
      const t = setTimeout(() => setVisible(false), 4000)
      return () => clearTimeout(t)
    }
  }, [searchParams, router])

  if (!visible) return null

  return (
    <div className="mb-6 px-5 py-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-medium flex items-center gap-2">
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
      </svg>
      Memorialul a fost actualizat cu succes.
    </div>
  )
}
