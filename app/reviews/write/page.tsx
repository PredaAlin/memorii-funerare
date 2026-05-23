import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { ReviewForm } from './ReviewForm'
import Link from 'next/link'

export default async function WriteReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const { orderId } = await searchParams
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    const cb = orderId ? `/reviews/write?orderId=${orderId}` : '/reviews/write'
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(cb)}`)
  }

  if (!orderId) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <p className="text-stone-500">Link invalid. Folosește linkul din email pentru a scrie o recenzie.</p>
        <Link href="/reviews" className="mt-6 inline-block text-amber-600 font-bold hover:underline">
          Vezi recenziile existente
        </Link>
      </div>
    )
  }

  const order = await db.order.findFirst({
    where: { id: orderId, userId: session.user.id, status: 'delivered' },
    include: { memorial: { select: { deceasedName: true } } },
  })

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <p className="text-stone-500">Această comandă nu este eligibilă pentru o recenzie. Comanda trebuie să fie marcată ca livrată.</p>
        <Link href="/dashboard" className="mt-6 inline-block text-amber-600 font-bold hover:underline">
          Înapoi la contul meu
        </Link>
      </div>
    )
  }

  const existing = await db.review.findUnique({ where: { orderId } })
  if (existing) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <p className="text-xl font-bold serif text-stone-800 mb-2">Recenzie trimisă!</p>
        <p className="text-stone-500">Ai trimis deja o recenzie pentru această comandă. Mulțumim!</p>
        <Link href="/reviews" className="mt-6 inline-block text-amber-600 font-bold hover:underline">
          Vezi toate recenziile
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Achiziție verificată</p>
        <h1 className="text-4xl font-bold serif text-stone-900 mb-3">Scrie o recenzie</h1>
        <p className="text-stone-500">
          Experiența ta îi ajută pe alții să onoreze amintirile celor dragi.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8">
        <ReviewForm orderId={orderId} deceasedName={order.memorial.deceasedName} />
      </div>
    </div>
  )
}
