'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'

export function Navigation() {
  const pathname = usePathname()
  const { cart } = useCart()
  const { data: session } = useSession()

  // Don't show the main nav on public memorial pages
  if (pathname.startsWith('/memorial/')) return null

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 py-4 px-6 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-stone-800 rounded-sm rotate-45 flex items-center justify-center">
          <div className="w-4 h-4 border border-white rotate-[-45deg]"></div>
        </div>
        <span className="text-xl font-bold tracking-widest text-stone-800 serif">ETERNAL MEMORIES</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className={`text-sm font-medium ${pathname === '/' ? 'text-stone-900 border-b-2 border-stone-800' : 'text-stone-500 hover:text-stone-800'}`}
        >
          Acasă
</Link>

        {session ? (
          <>
            <Link
              href="/dashboard"
              className={`text-sm font-medium ${pathname === '/dashboard' ? 'text-stone-900 border-b-2 border-stone-800' : 'text-stone-500 hover:text-stone-800'}`}
            >
              Memorialele mele
            </Link>
            {session.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
              <Link
                href="/admin"
                className={`text-sm font-medium ${pathname === '/admin' ? 'text-amber-700 border-b-2 border-amber-600' : 'text-amber-600 hover:text-amber-700'}`}
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm font-medium text-stone-500 hover:text-stone-800"
            >
              Deconectare
            </button>
          </>
        ) : (
          <Link href="/auth/signin" className="text-sm font-medium text-stone-500 hover:text-stone-800">
            Autentificare
          </Link>
        )}

        <Link
          href="/cart"
          className="relative flex items-center gap-2 p-2 rounded-full hover:bg-stone-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
              {cart.length}
            </span>
          )}
          <span className="text-sm font-medium text-stone-700">Coș</span>
        </Link>
      </div>
    </nav>
  )
}
