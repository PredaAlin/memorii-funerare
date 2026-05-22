import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const memorial = await db.memorial.findUnique({ where: { id } })
  if (!memorial) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // Only the owner can see unpublished memorials
  if (!memorial.isPublished) {
    const session = await getServerSession(authOptions)
    if (session?.user?.id !== memorial.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }
  return NextResponse.json(memorial)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const memorial = await db.memorial.findUnique({ where: { id } })
  if (!memorial || memorial.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const updated = await db.memorial.update({
    where: { id },
    data: {
      deceasedName: body.deceasedName ?? memorial.deceasedName,
      birthDate: body.birthDate ?? memorial.birthDate,
      deathDate: body.deathDate ?? memorial.deathDate,
      bio: body.bio ?? memorial.bio,
      quote: body.quote ?? memorial.quote,
      mediaUrls: body.mediaUrls ?? memorial.mediaUrls,
      videoUrls: body.videoUrls ?? memorial.videoUrls,
      theme: body.theme ?? memorial.theme,
    },
  })
  return NextResponse.json(updated)
}
