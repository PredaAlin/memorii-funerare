import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

function formatAuthor(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0]
}

export async function GET() {
  const reviews = await db.review.findMany({
    include: { order: { select: { shippingName: true, shippingCity: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(
    reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      body: r.body,
      author: formatAuthor(r.order.shippingName),
      city: r.order.shippingCity,
      createdAt: r.createdAt.toISOString(),
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { orderId, rating, body } = await req.json()

  if (!orderId || typeof rating !== 'number' || rating < 1 || rating > 5 || !body?.trim()) {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 })
  }

  const order = await db.order.findFirst({
    where: { id: orderId, userId: session.user.id, status: 'delivered' },
  })
  if (!order) {
    return NextResponse.json({ error: 'Comandă invalidă sau livrarea neconfirmată' }, { status: 403 })
  }

  const existing = await db.review.findUnique({ where: { orderId } })
  if (existing) {
    return NextResponse.json({ error: 'Ai trimis deja o recenzie pentru această comandă' }, { status: 409 })
  }

  const review = await db.review.create({
    data: { userId: session.user.id, orderId, rating, body: body.trim() },
  })

  return NextResponse.json(review, { status: 201 })
}
