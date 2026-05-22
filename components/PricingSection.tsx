'use client'

import { useRouter } from 'next/navigation'
import { useCart, PRICES } from '@/contexts/CartContext'
import { MemorialPlan } from '@/types'

export function PricingSection() {
  const router = useRouter()
  const { addToCart } = useCart()

  const handleAddToCart = (plan: MemorialPlan) => {
    addToCart(plan)
    router.push('/cart')
  }

  return (
    <section id="plans" className="max-w-6xl mx-auto px-6 py-20 bg-white">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold serif text-stone-900 mb-4">Alege-ți Moștenirea</h2>
        <p className="text-stone-500">Selectează planul care îl onorează cel mai bine pe cel drag.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Basic Plan */}
        <div className="bg-white border-2 border-stone-200 rounded-3xl p-10 shadow-sm hover:shadow-xl transition-all flex flex-col group">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Esențial</span>
            <h2 className="text-3xl font-bold serif text-stone-800 mt-2">Memoriu de Bază</h2>
            <p className="text-5xl font-bold text-stone-900 mt-6">${PRICES.basic}</p>
          </div>
          <ul className="space-y-4 mb-10 flex-grow text-sm">
            {['Placă de oțel inscripționată QR', 'Găzduire date 10 ani', 'Stocare 100MB (Doar Fotografii)'].map(f => (
              <li key={f} className="flex items-center gap-3 text-stone-600">
                <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleAddToCart('basic')}
            className="w-full py-5 bg-stone-100 text-stone-800 rounded-full font-bold hover:bg-stone-200 transition-all active:scale-95"
          >
            Alege de Bază
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-stone-900 border-2 border-amber-600/30 rounded-3xl p-10 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute top-6 right-6 bg-amber-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Recomandat</div>
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500/60">Profesional</span>
            <h2 className="text-3xl font-bold serif text-white mt-2">Moștenire Premium</h2>
            <p className="text-5xl font-bold text-white mt-6">${PRICES.premium}</p>
          </div>
          <ul className="space-y-4 mb-10 flex-grow text-sm">
            {['Placă de oțel inscripționată QR', 'Găzduire garantată pe viață', 'Stocare 300MB (Fotografii + Videoclipuri)'].map(f => (
              <li key={f} className="flex items-center gap-3 text-stone-300">
                <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleAddToCart('premium')}
            className="w-full py-5 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-500 transition-all active:scale-95 shadow-lg shadow-amber-600/20"
          >
            Alege Premium
          </button>
        </div>
      </div>
    </section>
  )
}
