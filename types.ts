export type MemorialPlan = 'basic' | 'premium'

export type MemorialThemeId =
  | 'clasic' | 'noapte' | 'natura' | 'serenitate' | 'vintage'
  | 'aurora' | 'smarald' | 'trandafir' | 'lavanda' | 'apus'

export interface FamilyPartner {
  id: string
  name: string
  relation?: string
  isSelf?: boolean
  memorialId?: string               // optional link to that person's memorial page
}

export interface FamilyMember {
  id: string
  name: string
  relation?: string                 // free label, e.g. "Tată", "Bunic"
  isSelf?: boolean                  // the deceased — highlighted; at most one in the tree (incl. partners)
  memorialId?: string               // optional link to that person's memorial page
  spouse?: FamilyPartner | null
  children: FamilyMember[]
}

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
  candlesEnabled: boolean
  memoriesEnabled: boolean
  familyTreeEnabled: boolean
  familyTree: FamilyMember | null
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
