'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MemorialEditor } from '@/components/MemorialEditor'
import type { MemorialContent, MemorialPlan, MemorialThemeId } from '@/types'

interface Props {
  memorial: {
    id: string
    deceasedName: string
    birthDate: string
    deathDate: string
    bio: string
    quote: string
    profilePhoto: string
    bannerPhoto: string
    mediaUrls: string[]
    videoUrls: string[]
    theme: MemorialThemeId
    plan: MemorialPlan
  }
}

export function EditForm({ memorial }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const initialData: MemorialContent = {
    id: memorial.id,
    deceasedName: memorial.deceasedName,
    birthDate: memorial.birthDate,
    deathDate: memorial.deathDate,
    bio: memorial.bio,
    quote: memorial.quote,
    profilePhoto: memorial.profilePhoto,
    bannerPhoto: memorial.bannerPhoto,
    media: memorial.mediaUrls,
    videos: memorial.videoUrls,
    theme: memorial.theme,
    plan: memorial.plan,
  }

  const handleSave = async (data: MemorialContent) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/memorials/${memorial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deceasedName: data.deceasedName,
          birthDate: data.birthDate,
          deathDate: data.deathDate,
          bio: data.bio,
          quote: data.quote,
          mediaUrls: data.media,
          videoUrls: data.videos,
          theme: data.theme,
          profilePhotoUrl: data.profilePhoto,
          bannerPhotoUrl: data.bannerPhoto,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      router.push('/dashboard?saved=1')
    } catch {
      alert('Salvarea a eșuat. Încearcă din nou.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-4xl">
      <MemorialEditor
        initialData={initialData}
        onSave={handleSave}
        onCancel={() => router.push('/dashboard')}
        saveLabel={saving ? 'Se salvează…' : 'Actualizează Memorialul'}
      />
    </div>
  )
}
