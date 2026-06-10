'use client'

import { usePathname } from 'next/navigation'

export function SiteFooter() {
  const pathname = usePathname()
  if (pathname.startsWith('/memorial/')) return null

  return (
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
  )
}
