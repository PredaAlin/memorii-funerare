'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'

export default function CartPage() {
  const router = useRouter()
  const {
    cart, shippingInfo, setShippingInfo,
    removeFromCart, total,
    showValidationErrors, setShowValidationErrors,
    canCheckout, isShippingValid,
  } = useCart()

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
      <h2 className="text-4xl font-bold mb-8 serif text-stone-800">Your Memorial Plates</h2>

      {cart.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-3xl bg-white">
          <p className="text-stone-500 mb-6">Your cart is empty.</p>
          <Link href="/" className="text-amber-800 font-semibold underline underline-offset-4">Start creating a legacy</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Cart items */}
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>
                    <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded text-[8px] font-bold uppercase ${item.memorialData.plan === 'premium' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                      {item.memorialData.plan}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-800 serif">{item.memorialData.deceasedName || 'Untitled Memorial'}</h3>
                    <p className="text-stone-500 text-sm">{item.memorialData.plan === 'premium' ? 'Lifetime Hosting + Video Support' : '10-Year Hosting (Images Only)'}</p>
                    <div className="mt-2">
                      {item.isConfigured ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-green-50 text-green-700 rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                          READY
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-full">CONFIG REQUIRED</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {item.isConfigured && (
                    <button
                      onClick={() => router.push(`/preview?id=${item.id}`)}
                      className="px-4 py-2 border border-stone-300 text-stone-600 rounded-full font-medium hover:bg-stone-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      Preview
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/editor?id=${item.id}`)}
                    className="px-6 py-2 bg-stone-100 text-stone-800 rounded-full font-medium hover:bg-stone-200 transition-colors"
                  >
                    {item.isConfigured ? 'Edit' : 'Setup Page'}
                  </button>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-stone-400 hover:text-red-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Shipping form */}
          <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-xl font-bold serif text-stone-800 mb-6">Shipping & Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Full Name', key: 'fullName' as const, type: 'text', placeholder: 'Recipient Name' },
                { label: 'Email Address', key: 'email' as const, type: 'email', placeholder: 'email@example.com' },
                { label: 'Phone Number', key: 'phone' as const, type: 'tel', placeholder: '+1 (555) 000-0000' },
                { label: 'City', key: 'city' as const, type: 'text', placeholder: 'City' },
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
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Shipping Address</label>
                <textarea
                  value={shippingInfo.address}
                  onChange={e => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${field('address')} focus:ring-2 focus:ring-amber-500 outline-none transition-all h-24 resize-none`}
                  placeholder="Street Address, Apartment, etc."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Postal Code</label>
                <input
                  type="text"
                  value={shippingInfo.postalCode}
                  onChange={e => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border ${field('postalCode')} focus:ring-2 focus:ring-amber-500 outline-none transition-all`}
                  placeholder="12345"
                />
              </div>
            </div>
          </div>

          {/* Total & checkout */}
          <div className="p-8 bg-stone-900 rounded-3xl text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
            <div>
              <p className="text-stone-400 font-medium">Order Total</p>
              <p className="text-4xl font-bold serif">${total.toFixed(2)}</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <button
                onClick={handleCheckoutAttempt}
                className="px-10 py-4 bg-amber-600 rounded-full font-bold text-lg hover:bg-amber-500 transition-all shadow-lg active:scale-95"
              >
                Proceed to Payment
              </button>
              {showValidationErrors && !canCheckout() && (
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider animate-pulse text-center md:text-right">
                  * Please complete all forms and memorial pages
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
