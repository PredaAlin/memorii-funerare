import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, clientIp } from '@/lib/rateLimit'

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params

  if (!rateLimit(`candle:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Prea multe încercări. Încearcă din nou în curând.' }, { status: 429 })
  }

  const memorial = await db.memorial.findUnique({ where: { id } })
  if (!memorial || !memorial.isPublished || !memorial.candlesEnabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await db.memorial.update({
    where: { id },
    data: { candleCount: { increment: 1 } },
    select: { candleCount: true },
  })

  return NextResponse.json({ candleCount: updated.candleCount })
}
