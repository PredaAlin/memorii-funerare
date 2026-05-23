import { db } from '@/lib/db'
import Link from 'next/link'

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg className={`w-4 h-4 ${filled ? 'text-amber-500' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

function formatAuthor(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0]
}

export default async function ReviewsPage() {
  const reviews = await db.review.findMany({
    include: { order: { select: { shippingName: true, shippingCity: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Recenzii Verificate</p>
        <h1 className="text-5xl font-bold serif text-stone-900 mb-4">Ce spun familiile</h1>
        <p className="text-stone-500 mb-4">Recenzii lăsate exclusiv de clienți cu achiziții confirmate.</p>
        {avgRating && (
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <StarIcon key={s} filled={s <= Math.round(Number(avgRating))} />
              ))}
            </div>
            <span className="text-stone-700 font-bold">{avgRating}</span>
            <span className="text-stone-400 text-sm">({reviews.length} recenzii)</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-400 text-lg mb-2">Nicio recenzie încă.</p>
          <p className="text-stone-400 text-sm">Fii primul care împărtășește experiența sa.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= r.rating} />)}
              </div>
              <p className="text-stone-700 italic leading-relaxed flex-grow mb-6">&ldquo;{r.body}&rdquo;</p>
              <div>
                <p className="font-bold text-stone-900 text-sm">{formatAuthor(r.order.shippingName)}</p>
                <p className="text-xs text-stone-400 uppercase tracking-widest mt-0.5">
                  {r.order.shippingCity} · {r.createdAt.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-16">
        <Link
          href="/"
          className="text-stone-400 hover:text-stone-600 text-sm font-medium transition-colors"
        >
          ← Înapoi acasă
        </Link>
      </div>
    </div>
  )
}
