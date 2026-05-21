export type MemorialPlan = 'basic' | 'premium'

export interface MemorialContent {
  id: string
  deceasedName: string
  birthDate: string
  deathDate: string
  bio: string
  media: string[]   // base64 data URLs (client) or remote URLs (after upload)
  videos: string[]  // base64 data URLs (client) or remote URLs (after upload)
  quote: string
  plan: MemorialPlan
}

export interface ShippingInfo {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
}

export interface CartItem {
  id: string
  quantity: number
  price: number
  memorialData: MemorialContent
  isConfigured: boolean
}

export type AppView = 'home' | 'cart' | 'editor' | 'checkout' | 'success' | 'preview'
