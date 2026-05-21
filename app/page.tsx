import { PricingSection } from '@/components/PricingSection'

const TESTIMONIALS = [
  { quote: "A beautiful way to share Grandpa's stories with the younger generation who never met him. It brings the cemetery to life.", author: 'Sarah Jenkins', location: 'London, UK' },
  { quote: "The stainless steel plate is incredibly durable. It survived a harsh mountain winter and still scans perfectly. Truly premium.", author: 'Michael Ross', location: 'Denver, CO' },
  { quote: "The AI assistant helped me find the words when I was too overwhelmed by grief. It's more than a product; it's a service for the soul.", author: 'David L.', location: 'Sydney, AU' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-24 text-center">
        <h1 className="text-5xl md:text-8xl font-bold leading-tight text-stone-900 serif mb-8 tracking-tight">
          Keep Their <br />
          <span className="text-amber-700 italic">Legacy</span> Alive.
        </h1>
        <p className="text-xl md:text-2xl text-stone-600 leading-relaxed max-w-2xl mx-auto mb-12 font-light">
          Secure a permanent digital resting place linked to a premium stainless steel plate. A bridge between generations.
        </p>
        <div className="flex justify-center gap-6">
          <a href="#plans" className="px-10 py-5 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all shadow-xl hover:shadow-2xl">
            Choose a Plan
          </a>
        </div>
      </section>

      {/* Real World Example */}
      <section className="bg-stone-50 py-20 px-6 border-y border-stone-200">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-amber-600/10 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.dw.com/image/16348639_6.jpg"
              alt="Real world example of QR memorial"
              className="relative rounded-3xl shadow-2xl border-4 border-white grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl max-w-[240px] border border-stone-100 hidden md:block">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">In Practice</p>
              <p className="text-sm text-stone-600 italic">&ldquo;It turns a static stone into a library of memories for everyone who visits.&rdquo;</p>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl font-bold serif text-stone-900">The Physical <br />meets the Digital</h2>
            <p className="text-lg text-stone-600 leading-relaxed">
              Our plates are designed to withstand the elements for decades. When a visitor scans the QR code, they aren&apos;t just reading a name—they&apos;re entering a gallery of a life well-lived.
            </p>
            <ul className="space-y-4">
              {['Laser-etched medical grade steel', 'Instant loading mobile interface', 'No app required for visitors', 'Update content anytime from home'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 text-stone-800 font-medium">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold serif text-stone-900 mb-4">Loved by Families</h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full"></div>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-stone-50 border border-stone-100 flex flex-col justify-between hover:scale-105 transition-transform duration-300">
              <div>
                <div className="flex gap-1 text-amber-500 mb-6">
                  {[1, 2, 3, 4, 5].map(s => (
                    <svg key={s} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-stone-700 italic leading-relaxed mb-8">&ldquo;{t.quote}&rdquo;</p>
              </div>
              <div>
                <p className="font-bold text-stone-900">{t.author}</p>
                <p className="text-xs text-stone-400 font-bold tracking-widest uppercase">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing — client component (needs addToCart) */}
      <PricingSection />
    </div>
  )
}
