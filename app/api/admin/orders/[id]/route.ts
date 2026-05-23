import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { buildOrderEmailData, sendDeliveredNotification, sendShippedNotification } from '@/lib/email'

const VALID_STATUSES = ['pending', 'paid', 'shipped', 'delivered']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { status } = await req.json()

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const order = await db.order.update({
    where: { id },
    data: { status },
    include: { memorial: true },
  })

  if (status === 'shipped') {
    sendShippedNotification(buildOrderEmailData(order)).catch((err) =>
      console.error('Failed to send shipped notification:', err)
    )
  }

  if (status === 'delivered') {
    sendDeliveredNotification(buildOrderEmailData(order)).catch((err) =>
      console.error('Failed to send delivered notification:', err)
    )
  }

  return NextResponse.json(order)
}
