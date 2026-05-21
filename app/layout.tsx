import type { Metadata } from 'next'
import { Cinzel, Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { Navigation } from '@/components/Navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'Eternal Memories QR',
  description: 'A respectful platform for creating digital memorials linked to QR-inscribed metal plates for tombstones.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-grow">
              {children}
            </main>
            <footer className="bg-stone-100 border-t border-stone-200 py-12 px-6">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-stone-800 rounded-sm rotate-45 flex items-center justify-center">
                    <div className="w-3 h-3 border border-white rotate-[-45deg]"></div>
                  </div>
                  <span className="text-sm font-bold tracking-widest text-stone-500 serif">ETERNAL MEMORIES</span>
                </div>
                <p className="text-stone-400 text-sm">© 2024 Eternal Memories Inc.</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
