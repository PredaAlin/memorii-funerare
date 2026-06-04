'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { cart, shippingInfo, total } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ramburs'>('card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (cart.length === 0) {
    router.replace('/cart')
    return null
  }

  const handlePay = async () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/checkout')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, shippingInfo, paymentMethod }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create order')
      if (paymentMethod === 'ramburs') {
        router.push(data.url)
      } else {
        window.location.href = data.url // Redirect to Stripe Checkout
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <h2 className="text-3xl font-bold mb-6 serif text-stone-800">Finalizează Comanda</h2>
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
        <div className="flex justify-between text-stone-600">
          <span>Produse ({cart.length})</span>
          <span>{total.toFixed(2)} lei</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Livrare în {shippingInfo.city}</span>
          <span className="text-green-600 font-bold text-xs">GRATUIT</span>
        </div>
        <div className="border-t border-stone-100 pt-4 flex justify-between font-bold text-xl serif text-stone-900">
          <span>Total</span>
          <span>{total.toFixed(2)} lei</span>
        </div>

        {/* Payment method selector */}
        <div className="text-left space-y-3">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Metodă de plată</p>
          <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
            paymentMethod === 'card' ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-300'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
              className="mt-0.5 accent-stone-900"
            />
            <div>
              <p className="font-bold text-stone-800 text-sm">Card online</p>
              <p className="text-stone-500 text-xs mt-0.5">Plată securizată prin Stripe</p>
            </div>
          </label>
          <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
            paymentMethod === 'ramburs' ? 'border-amber-600 bg-amber-50' : 'border-stone-200 hover:border-stone-300'
          }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="ramburs"
              checked={paymentMethod === 'ramburs'}
              onChange={() => setPaymentMethod('ramburs')}
              className="mt-0.5 accent-amber-600"
            />
            <div>
              <p className="font-bold text-stone-800 text-sm">Ramburs — la livrare</p>
              <p className="text-stone-500 text-xs mt-0.5">Plătești curierului când primești coletul</p>
            </div>
          </label>
        </div>

        {!session && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-xl p-3 font-medium">
            Vei fi rugat să te autentifici înainte de plată pentru a lega memoriul de contul tău.
          </p>
        )}

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

        <button
          onClick={handlePay}
          disabled={loading}
          className={`w-full py-4 text-white rounded-full font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${
            paymentMethod === 'ramburs'
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-stone-900 hover:bg-stone-800'
          }`}
        >
          {loading
            ? 'Se pregătește comanda...'
            : paymentMethod === 'ramburs'
              ? 'Plasează Comanda'
              : 'Plătește cu Stripe'
          }
        </button>
        <button onClick={() => router.push('/cart')} className="w-full py-2 text-stone-400 font-bold text-sm hover:text-stone-600">
          Înapoi la Coș
        </button>
      </div>
    </div>
  )
}
