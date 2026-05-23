'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ReviewFormProps {
  orderId: string
  deceasedName: string
}

export function ReviewForm({ orderId, deceasedName }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setError('Te rugăm să selectezi un număr de stele.'); return }
    if (body.trim().length < 10) { setError('Recenzia trebuie să aibă cel puțin 10 caractere.'); return }

    setError('')
    setLoading(true)

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, rating, body }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'A apărut o eroare.')
      setLoading(false)
      return
    }

    router.push('/reviews')
  }

  const active = hovered || rating

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
          Evaluare
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none"
            >
              <svg
                className={`w-9 h-9 transition-colors ${s <= active ? 'text-amber-500' : 'text-stone-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
          Recenzia ta pentru {deceasedName}
        </label>
        <textarea
          required
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={5}
          placeholder="Cum a fost experiența ta? Ce ai apreciat cel mai mult?"
          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
        />
        <p className="text-xs text-stone-400 mt-1 text-right">{body.length} caractere</p>
      </div>

      {error && (
        <p className="text-xs text-red-600 font-medium bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all shadow-md disabled:opacity-50"
      >
        {loading ? 'Se trimite...' : 'Trimite recenzia'}
      </button>
    </form>
  )
}
