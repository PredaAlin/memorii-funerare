import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const memorials = await db.memorial.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(memorials)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const memorial = await db.memorial.create({
    data: {
      userId: session.user.id,
      deceasedName: body.deceasedName,
      birthDate: body.birthDate || null,
      deathDate: body.deathDate || null,
      bio: body.bio || null,
      quote: body.quote || null,
      plan: body.plan,
      mediaUrls: body.mediaUrls ?? [],
      videoUrls: body.videoUrls ?? [],
      isPublished: false,
    },
  })
  return NextResponse.json(memorial, { status: 201 })
}
