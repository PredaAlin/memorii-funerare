import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { MemorialView } from '@/components/MemorialView'
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
  const memorial = await db.memorial.findUnique({ where: { id, isPublished: true } })

  if (!memorial) notFound()

  return <MemorialView memorial={memorial} />
}
