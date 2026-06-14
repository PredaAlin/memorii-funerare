import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { EditForm } from './EditForm'

interface Params { params: Promise<{ id: string }> }

export default async function EditMemorialPage({ params }: Params) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/auth/signin?callbackUrl=/edit/${id}`)

  const memorial = await db.memorial.findUnique({ where: { id } })

  if (!memorial || memorial.userId !== session.user.id) notFound()

  return (
    <div className="min-h-screen bg-stone-50 flex items-start justify-center py-12 px-4">
      <EditForm memorial={{
        id: memorial.id,
        deceasedName: memorial.deceasedName ?? '',
        birthDate: memorial.birthDate ?? '',
        deathDate: memorial.deathDate ?? '',
        bio: memorial.bio ?? '',
        quote: memorial.quote ?? '',
        profilePhoto: memorial.profilePhotoUrl ?? '',
        bannerPhoto: memorial.bannerPhotoUrl ?? '',
        mediaUrls: memorial.mediaUrls,
        videoUrls: memorial.videoUrls,
        theme: (memorial.theme ?? 'clasic') as import('@/types').MemorialThemeId,
        plan: memorial.plan as import('@/types').MemorialPlan,
        candlesEnabled: memorial.candlesEnabled,
        memoriesEnabled: memorial.memoriesEnabled,
      }} />
    </div>
  )
}
