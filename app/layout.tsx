import type { Metadata } from 'next'
import { Cinzel, Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { Navigation } from '@/components/Navigation'
import { SiteFooter } from '@/components/SiteFooter'
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Eternal Memories',
  url: 'https://eternalmemories.ro',
  logo: 'https://eternalmemories.ro/icon.svg',
  description: 'Plăci memoriale premium din oțel inoxidabil cu cod QR, legate de pagini digitale cu fotografii și povești.',
  areaServed: 'RO',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'alinpreda0711@gmail.com',
    contactType: 'customer service',
    availableLanguage: 'Romanian',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${inter.variable} ${cinzel.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-grow">
              {children}
            </main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  )
}
