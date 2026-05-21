import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderIds = session.metadata?.orderIds?.split(',') ?? []

    if (orderIds.length > 0) {
      // Mark orders as paid
      await db.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: 'paid' },
      })

      // Publish the associated memorials
      const orders = await db.order.findMany({
        where: { id: { in: orderIds } },
        select: { memorialId: true },
      })
      await db.memorial.updateMany({
        where: { id: { in: orders.map((o: { memorialId: string }) => o.memorialId) } },
        data: { isPublished: true },
      })
    }
  }

  return NextResponse.json({ received: true })
}
