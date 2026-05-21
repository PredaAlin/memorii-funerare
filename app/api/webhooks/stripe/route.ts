import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { buildOrderEmailData, sendPaymentConfirmation, sendAdminNewOrder } from '@/lib/email'
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
      await db.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: 'paid' },
      })

      const orders = await db.order.findMany({
        where: { id: { in: orderIds } },
        include: { memorial: true },
      })

      await db.memorial.updateMany({
        where: { id: { in: orders.map((o) => o.memorialId) } },
        data: { isPublished: true },
      })

      await Promise.allSettled(
        orders.map((order) => {
          const emailData = buildOrderEmailData(order)
          return Promise.all([
            sendPaymentConfirmation(emailData),
            sendAdminNewOrder(emailData),
          ])
        })
      )
    }
  }

  return NextResponse.json({ received: true })
}
