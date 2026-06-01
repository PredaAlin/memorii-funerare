import type { Metadata } from 'next'
import { Cinzel, Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { Navigation } from '@/components/Navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', weight: ['400', '700'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://eternalmemories.ro'),
  title: {
    default: 'Eternal Memories — Plăci Memoriale QR',
    template: '%s | Eternal Memories',
  },
  description: 'Plăci memoriale premium din oțel inoxidabil cu cod QR, legate de o pagină digitală cu fotografii și povești. Onorează amintirea celor dragi pentru generații.',
  keywords: ['memorial', 'placă memorială', 'cod QR', 'comemorare', 'placă funerară', 'amintire', 'cimitir', 'România', 'oțel inoxidabil'],
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: 'https://eternalmemories.ro',
    siteName: 'Eternal Memories',
    title: 'Eternal Memories — Plăci Memoriale QR',
    description: 'Plăci memoriale premium din oțel inoxidabil cu cod QR, legate de o pagină digitală cu fotografii și povești.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eternal Memories — Plăci Memoriale QR',
    description: 'Plăci memoriale premium din oțel inoxidabil cu cod QR. Onorează amintirea celor dragi pentru generații.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${inter.variable} ${cinzel.variable}`}>
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
                <p className="text-stone-400 text-sm">© {new Date().getFullYear()} Eternal Memories</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
