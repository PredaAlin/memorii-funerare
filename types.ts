export type MemorialPlan = 'basic' | 'premium'

export type MemorialThemeId = 'clasic' | 'noapte' | 'natura' | 'serenitate' | 'vintage'

export interface MemorialContent {
  id: string
  deceasedName: string
  birthDate: string
  deathDate: string
  bio: string
  media: string[]        // base64 data URLs (client) or remote URLs (after upload)
  videos: string[]       // base64 data URLs (client) or remote URLs (after upload)
  profilePhoto: string   // base64 or remote URL — dedicated profile picture
  bannerPhoto: string    // base64 or remote URL — dedicated cover/banner image
  quote: string
  plan: MemorialPlan
  theme: MemorialThemeId
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
