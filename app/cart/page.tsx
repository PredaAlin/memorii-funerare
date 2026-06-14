'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { MemorialPreview } from '@/components/MemorialPreview'

function CartContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [savedToast, setSavedToast] = useState(false)
  const [previewItemId, setPreviewItemId] = useState<string | null>(null)
  const {
    cart, shippingInfo, setShippingInfo,
    addToCart, removeFromCart, total,
    showValidationErrors, setShowValidationErrors,
    canCheckout, isShippingValid,
  } = useCart()

  const handleAddPlan = (plan: 'basic' | 'premium') => {
    const id = addToCart(plan)
    router.push(`/editor?id=${id}`)
  }

  useEffect(() => {
    if (searchParams.get('saved') === '1') {
      setSavedToast(true)
      router.replace('/cart', { scroll: false })
      const t = setTimeout(() => setSavedToast(false), 4000)
      return () => clearTimeout(t)
    }
  }, [searchParams, router])

  const handleCheckoutAttempt = () => {
    if (canCheckout()) {
      router.push('/checkout')
    } else {
      setShowValidationErrors(true)
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }
  }

  const field = (key: keyof typeof shippingInfo) =>
    showValidationErrors && !shippingInfo[key] ? 'border-red-300 bg-red-50' : 'border-stone-200'

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-4xl font-bold mb-8 serif text-stone-800">Plăcile tale Memoriale</h2>

      {savedToast && (
        <div className="mb-6 px-5 py-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
          </svg>
          Memorialul a fost salvat cu succes.
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-3xl bg-white">
          <p className="text-stone-500 mb-6">Coșul tău este gol.</p>
          <Link href="/" className="text-amber-800 font-semibold underline underline-offset-4">Începe să creezi o moștenire</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Cart items */}
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-20 h-20 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 relative">
                    {item.memorialData.profilePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.memorialData.profilePhoto} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>
                    )}
                    <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded text-[8px] font-bold uppercase ${item.memorialData.plan === 'premium' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                      {item.memorialData.plan}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-800 serif">{item.memorialData.deceasedName || 'Memorial fără titlu'}</h3>
                    <p className="text-stone-500 text-sm">{item.memorialData.plan === 'premium' ? 'Găzduire pe viață + Suport Video' : 'Găzduire 10 ani (Doar Imagini)'}</p>
                    <div className="mt-2">
                      {item.isConfigured ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-green-50 text-green-700 rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                          GATA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-full">NECESITĂ CONFIGURARE</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  {item.isConfigured && (
                    <button
                      onClick={() => setPreviewItemId(item.id)}
                      className="px-4 py-2 border border-stone-300 text-stone-600 rounded-full font-medium hover:bg-stone-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      Previzualizare
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/editor?id=${item.id}`)}
                    className="px-6 py-2 bg-stone-100 text-stone-800 rounded-full font-medium hover:bg-stone-200 transition-colors"
                  >
                    {item.isConfigured ? 'Editează' : 'Configurează Pagina'}
                  </button>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-stone-400 hover:text-red-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add another memorial */}
          <div className="border-2 border-dashed border-stone-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-stone-500 font-medium text-sm">Adaugă un alt memorial</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleAddPlan('basic')}
                className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 text-sm font-bold hover:bg-stone-50 transition-colors"
              >
                De Bază — 149.99 lei
              </button>
              <button
                onClick={() => handleAddPlan('premium')}
                className="px-5 py-2.5 rounded-full bg-amber-600 text-white text-sm font-bold hover:bg-amber-500 transition-colors"
              >
                Premium — 199.99 lei
              </button>
            </div>
          </div>

          {/* Shipping form */}
          <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-xl font-bold serif text-stone-800 mb-6">Date de Livrare și Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Nume Complet', key: 'fullName' as const, type: 'text', placeholder: 'Numele destinatarului' },
                { label: 'Adresă Email', key: 'email' as const, type: 'email', placeholder: 'email@exemplu.com' },
                { label: 'Număr de Telefon', key: 'phone' as const, type: 'tel', placeholder: '+40 7xx xxx xxx' },
                { label: 'Oraș', key: 'city' as const, type: 'text', placeholder: 'Oraș' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{label}</label>
                  <input
                    type={type}
                    value={shippingInfo[key]}
                    onChange={e => setShippingInfo({ ...shippingInfo, [key]: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${field(key)} focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Adresă de Livrare</label>
                <textarea
                  value={shippingInfo.address}
                  onChange={e => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${field('address')} focus:ring-2 focus:ring-amber-500 outline-none transition-all h-24 resize-none`}
                  placeholder="Stradă, număr, apartament..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cod Poștal</label>
                <input
                  type="text"
                  value={shippingInfo.postalCode}
                  onChange={e => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${field('postalCode')} focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                  placeholder="000000"
                />
              </div>
            </div>
          </div>

          {/* Total & checkout */}
          <div className="p-8 bg-stone-900 rounded-3xl text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
            <div>
              <p className="text-stone-400 font-medium">Total Comandă</p>
              <p className="text-4xl font-bold serif">{total.toFixed(2)} lei</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <button
                onClick={handleCheckoutAttempt}
                className="px-10 py-4 bg-amber-600 rounded-full font-bold text-lg hover:bg-amber-500 transition-all shadow-lg active:scale-95"
              >
                Continuă la Plată
              </button>
              {showValidationErrors && !canCheckout() && (
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider animate-pulse text-center md:text-right">
                  * Te rugăm să completezi toate formularele și paginile memoriale
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewItemId && (() => {
        const item = cart.find(i => i.id === previewItemId)
        if (!item) return null
        return (
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/80 p-4 overflow-y-auto"
            onClick={() => setPreviewItemId(null)}
          >
            <button
              onClick={() => setPreviewItemId(null)}
              className="shrink-0 px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition-colors"
            >
              ✕ Închide previzualizarea
            </button>
            <div onClick={e => e.stopPropagation()} className="shrink-0">
              <MemorialPreview data={item.memorialData} />
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default function CartPage() {
  return (
    <Suspense>
      <CartContent />
    </Suspense>
  )
}
