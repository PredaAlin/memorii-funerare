import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { MemorialView } from '@/components/MemorialView'
import type { FamilyMember } from '@/types'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const memorial = await db.memorial.findUnique({ where: { id, isPublished: true } })
  if (!memorial) return { title: 'Memorial Not Found' }
  return {
    title: `${memorial.deceasedName} — Eternal Memories`,
    description: memorial.bio?.slice(0, 160) ?? `A memorial for ${memorial.deceasedName}.`,
  }
}

export default async function MemorialPage({ params }: Props) {
  const { id } = await params
  const memorial = await db.memorial.findUnique({
    where: { id, isPublished: true },
    include: { tributes: { orderBy: { createdAt: 'desc' } } },
  })

  if (!memorial) notFound()

  const session = await getServerSession(authOptions)
  const isOwner = session?.user?.id === memorial.userId

  const tributes = memorial.tributes.map(t => ({
    id: t.id,
    authorName: t.authorName,
    relationship: t.relationship,
    body: t.body,
    createdAt: t.createdAt.toISOString(),
  }))

  const familyTree = (memorial.familyTree ?? null) as FamilyMember | null

  // Resolve which linked memorials are still published, so the tree only links live pages.
  const linkedIds = collectMemorialIds(familyTree).filter(linkedId => linkedId !== id)
  const validMemorialIds = linkedIds.length
    ? (await db.memorial.findMany({
        where: { id: { in: linkedIds }, isPublished: true },
        select: { id: true },
      })).map(m => m.id)
    : []

  return (
    <MemorialView
      memorial={{ ...memorial, tributes, familyTree }}
      isOwner={isOwner}
      validMemorialIds={validMemorialIds}
    />
  )
}

function collectMemorialIds(node: FamilyMember | null): string[] {
  if (!node) return []
  const ids: string[] = []
  if (node.memorialId) ids.push(node.memorialId)
  if (node.spouse?.memorialId) ids.push(node.spouse.memorialId)
  for (const child of node.children ?? []) ids.push(...collectMemorialIds(child))
  return ids
}
