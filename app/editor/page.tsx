'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { MemorialEditor } from '@/components/MemorialEditor'

function EditorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { cart, updateCartItem } = useCart()

  const id = searchParams.get('id')
  const item = cart.find(i => i.id === id)

  if (!item) {
    router.replace('/cart')
    return null
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-6 py-4 sm:py-12 flex justify-center">
      <MemorialEditor
        initialData={item.memorialData}
        onSave={(data) => {
          updateCartItem(id!, data)
          router.push(`/preview?id=${id}`)
        }}
        onCancel={() => router.push('/cart')}
      />
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense>
      <EditorContent />
    </Suspense>
  )
}
