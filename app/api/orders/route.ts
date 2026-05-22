import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { put } from '@vercel/blob'
import { CartItem, ShippingInfo } from '@/types'

// Convert a base64 data URL to a Vercel Blob URL
async function uploadIfBase64(dataUrl: string, folder: string): Promise<string> {
  if (!dataUrl.startsWith('data:')) return dataUrl // Already a remote URL
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return dataUrl
  const [, mime, b64] = match
  const ext = mime.split('/')[1] ?? 'bin'
  const buffer = Buffer.from(b64, 'base64')
  const blob = await put(`${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`, buffer, {
    access: 'public',
    contentType: mime,
  })
  return blob.url
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { cart, shippingInfo }: { cart: CartItem[]; shippingInfo: ShippingInfo } = await req.json()

  if (!cart?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })

  // Create Memorial + Order records, upload media to blob
  const orderIds: string[] = []

  for (const item of cart) {
    const mediaUrls = await Promise.all(item.memorialData.media.map(m => uploadIfBase64(m, 'media')))
    const videoUrls = await Promise.all(item.memorialData.videos.map(v => uploadIfBase64(v, 'videos')))
    const profilePhotoUrl = item.memorialData.profilePhoto ? await uploadIfBase64(item.memorialData.profilePhoto, 'media') : null
    const bannerPhotoUrl = item.memorialData.bannerPhoto ? await uploadIfBase64(item.memorialData.bannerPhoto, 'media') : null

    const memorial = await db.memorial.create({
      data: {
        userId: session.user.id,
        deceasedName: item.memorialData.deceasedName,
        birthDate: item.memorialData.birthDate || null,
        deathDate: item.memorialData.deathDate || null,
        bio: item.memorialData.bio || null,
        quote: item.memorialData.quote || null,
        plan: item.memorialData.plan,
        mediaUrls,
        videoUrls,
        profilePhotoUrl,
        bannerPhotoUrl,
        isPublished: false,
      },
    })

    const order = await db.order.create({
      data: {
        userId: session.user.id,
        memorialId: memorial.id,
        plan: item.memorialData.plan,
        price: item.price,
        status: 'pending',
        shippingName: shippingInfo.fullName,
        shippingEmail: shippingInfo.email,
        shippingPhone: shippingInfo.phone,
        shippingAddress: shippingInfo.address,
        shippingCity: shippingInfo.city,
        shippingPostalCode: shippingInfo.postalCode,
      },
    })
    orderIds.push(order.id)
  }

  // Create Stripe Checkout session
  const lineItems = cart.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: `${item.memorialData.plan === 'premium' ? 'Premium Legacy' : 'Basic Memorial'} — ${item.memorialData.deceasedName || 'Untitled'}`,
        description: item.memorialData.plan === 'premium'
          ? 'Lifetime hosting + video support, 300MB storage'
          : '10-year hosting, 100MB photo storage',
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: 1,
  }))

  const baseUrl = process.env.NEXTAUTH_URL
  if (!baseUrl) throw new Error('NEXTAUTH_URL is not set')

  const stripeSession = await getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    customer_email: shippingInfo.email,
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cart`,
    metadata: { orderIds: orderIds.join(',') },
  })

  // Save session ID to all orders
  await db.order.updateMany({
    where: { id: { in: orderIds } },
    data: { stripeSessionId: stripeSession.id },
  })

  return NextResponse.json({ url: stripeSession.url })
}
