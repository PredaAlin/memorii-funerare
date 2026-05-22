'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'

export function Navigation() {
  const pathname = usePathname()
  const { cart } = useCart()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  if (pathname.startsWith('/memorial/')) return null

  const close = () => setOpen(false)

  const desktopLink = (href: string, label: string, isAdmin = false) => (
    <Link
      href={href}
      className={`text-sm font-medium ${
        isAdmin
          ? pathname === href ? 'text-amber-700 border-b-2 border-amber-600' : 'text-amber-600 hover:text-amber-700'
          : pathname === href ? 'text-stone-900 border-b-2 border-stone-800' : 'text-stone-500 hover:text-stone-800'
      }`}
    >
      {label}
    </Link>
  )

  const mobileLink = (href: string, label: string, isAdmin = false) => (
    <Link
      href={href}
      onClick={close}
      className={`block py-3 text-base font-medium border-b border-stone-50 ${
        isAdmin ? 'text-amber-600' : pathname === href ? 'text-stone-900 font-bold' : 'text-stone-600'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
      {/* Main bar */}
      <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 min-w-0" onClick={close}>
          <div className="w-8 h-8 shrink-0 bg-stone-800 rounded-sm rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 border border-white rotate-[-45deg]"></div>
          </div>
          <span className="text-base sm:text-xl font-bold tracking-widest text-stone-800 serif truncate">
            ETERNAL MEMORIES
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4">
          {desktopLink('/', 'Acasă')}
          {session ? (
            <>
              {desktopLink('/dashboard', 'Memorialele mele')}
              {session.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
                desktopLink('/admin', 'Admin', true)}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm font-medium text-stone-500 hover:text-stone-800"
              >
                Deconectare
              </button>
            </>
          ) : (
            desktopLink('/auth/signin', 'Autentificare')
          )}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 p-2 rounded-full hover:bg-stone-100 transition-colors"
          >
            <CartIcon />
            {cart.length > 0 && <CartBadge count={cart.length} />}
            <span className="text-sm font-medium text-stone-700">Coș</span>
          </Link>
        </div>

        {/* Mobile: cart icon + hamburger */}
        <div className="flex md:hidden items-center gap-1">
          <Link
            href="/cart"
            onClick={close}
            className="relative p-2 rounded-full hover:bg-stone-100 transition-colors"
          >
            <CartIcon />
            {cart.length > 0 && <CartBadge count={cart.length} />}
          </Link>
          <button
            onClick={() => setOpen(prev => !prev)}
            className="p-2 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Meniu"
          >
            {open ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t border-stone-100 px-6 pt-2 pb-6 space-y-0 shadow-lg">
          {mobileLink('/', 'Acasă')}
          {mobileLink('/cart', cart.length > 0 ? `Coș (${cart.length})` : 'Coș')}
          {session ? (
            <>
              {mobileLink('/dashboard', 'Memorialele mele')}
              {session.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
                mobileLink('/admin', 'Admin', true)}
              <button
                onClick={() => { signOut({ callbackUrl: '/' }); close() }}
                className="block w-full text-left py-3 text-base font-medium text-stone-600 border-b border-stone-50"
              >
                Deconectare
              </button>
            </>
          ) : (
            mobileLink('/auth/signin', 'Autentificare')
          )}
        </div>
      )}
    </nav>
  )
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  )
}

function CartBadge({ count }: { count: number }) {
  return (
    <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
      {count}
    </span>
  )
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
