import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params { params: Promise<{ id: string; tributeId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, tributeId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const memorial = await db.memorial.findUnique({ where: { id } })
  if (!memorial || memorial.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const tribute = await db.tribute.findUnique({ where: { id: tributeId } })
  if (!tribute || tribute.memorialId !== id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.tribute.delete({ where: { id: tributeId } })
  return NextResponse.json({ ok: true })
}
