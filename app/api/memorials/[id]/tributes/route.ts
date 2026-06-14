import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, clientIp } from '@/lib/rateLimit'

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params

  if (!rateLimit(`tribute:${clientIp(req)}`, 3, 10 * 60_000)) {
    return NextResponse.json({ error: 'Ai trimis prea multe amintiri. Încearcă din nou mai târziu.' }, { status: 429 })
  }

  const memorial = await db.memorial.findUnique({ where: { id } })
  if (!memorial || !memorial.isPublished || !memorial.memoriesEnabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const authorNameRaw = typeof body?.authorName === 'string' ? body.authorName.trim() : ''
  const message = typeof body?.body === 'string' ? body.body.trim() : ''
  const relationshipRaw = typeof body?.relationship === 'string' ? body.relationship.trim() : ''

  if (authorNameRaw.length > 60) {
    return NextResponse.json({ error: 'Numele poate avea cel mult 60 de caractere.' }, { status: 400 })
  }
  const authorName = authorNameRaw || 'Anonim'
  if (message.length < 1 || message.length > 1000) {
    return NextResponse.json({ error: 'Mesajul trebuie să aibă între 1 și 1000 de caractere.' }, { status: 400 })
  }
  if (relationshipRaw.length > 40) {
    return NextResponse.json({ error: 'Relația poate avea cel mult 40 de caractere.' }, { status: 400 })
  }

  const tribute = await db.tribute.create({
    data: {
      memorialId: id,
      authorName,
      body: message,
      relationship: relationshipRaw || null,
    },
  })

  return NextResponse.json({
    id: tribute.id,
    authorName: tribute.authorName,
    relationship: tribute.relationship,
    body: tribute.body,
    createdAt: tribute.createdAt.toISOString(),
  })
}
