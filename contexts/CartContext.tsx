'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { CartItem, MemorialContent, MemorialPlan, ShippingInfo } from '@/types'

export const PRICES: Record<MemorialPlan, number> = {
  basic: 49.99,
  premium: 89.99,
}

const INITIAL_SHIPPING: ShippingInfo = {
  fullName: '', email: '', phone: '', address: '', city: '', postalCode: '',
}

interface CartContextType {
  cart: CartItem[]
  shippingInfo: ShippingInfo
  showValidationErrors: boolean
  addToCart: (plan: MemorialPlan) => void
  updateCartItem: (id: string, data: MemorialContent) => void
  removeFromCart: (id: string) => void
  setShippingInfo: (info: ShippingInfo) => void
  setShowValidationErrors: (v: boolean) => void
  clearCart: () => void
  total: number
  isShippingValid: () => boolean
  canCheckout: () => boolean
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(INITIAL_SHIPPING)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('em_cart')
      const storedShipping = localStorage.getItem('em_shipping')
      if (storedCart) setCart(JSON.parse(storedCart))
      if (storedShipping) setShippingInfo(JSON.parse(storedShipping))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem('em_cart', JSON.stringify(cart))
  }, [cart, hydrated])

  useEffect(() => {
    if (hydrated) localStorage.setItem('em_shipping', JSON.stringify(shippingInfo))
  }, [shippingInfo, hydrated])

  const addToCart = (plan: MemorialPlan) => {
    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      quantity: 1,
      price: PRICES[plan],
      isConfigured: false,
      memorialData: {
        id: '', deceasedName: '', birthDate: '', deathDate: '',
        bio: '', media: [], videos: [], quote: '', plan,
      },
    }
    setCart(prev => [...prev, newItem])
  }

  const updateCartItem = (id: string, data: MemorialContent) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, memorialData: data, isConfigured: true } : item
    ))
  }

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id))

  const clearCart = () => {
    setCart([])
    setShippingInfo(INITIAL_SHIPPING)
    setShowValidationErrors(false)
    localStorage.removeItem('em_cart')
    localStorage.removeItem('em_shipping')
  }

  const isShippingValid = () =>
    Object.values(shippingInfo).every(v => v.trim().length > 0) &&
    shippingInfo.email.includes('@')

  const canCheckout = () =>
    cart.length > 0 && cart.every(i => i.isConfigured) && isShippingValid()

  const total = cart.reduce((acc, item) => acc + item.price, 0)

  return (
    <CartContext.Provider value={{
      cart, shippingInfo, showValidationErrors,
      addToCart, updateCartItem, removeFromCart,
      setShippingInfo, setShowValidationErrors,
      clearCart, total, isShippingValid, canCheckout,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
