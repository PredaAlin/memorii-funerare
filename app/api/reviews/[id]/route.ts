import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const { id } = await params
  const { rating, body } = await req.json()

  if (typeof rating !== 'number' || rating < 1 || rating > 5 || !body?.trim()) {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 })
  }

  const review = await db.review.findUnique({ where: { id } })
  if (!review || review.userId !== session.user.id) {
    return NextResponse.json({ error: 'Recenzie negăsită' }, { status: 404 })
  }

  const updated = await db.review.update({
    where: { id },
    data: { rating, body: body.trim() },
  })

  return NextResponse.json(updated)
}
