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
    candlesEnabled: boolean
    memoriesEnabled: boolean
  }
}

export function EditForm({ memorial }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

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
    candlesEnabled: memorial.candlesEnabled,
    memoriesEnabled: memorial.memoriesEnabled,
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
          candlesEnabled: data.candlesEnabled,
          memoriesEnabled: data.memoriesEnabled,
          profilePhotoUrl: data.profilePhoto,
          bannerPhotoUrl: data.bannerPhoto,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      router.push('/dashboard?saved=1')
    } catch {
      setSaveError('Salvarea a eșuat. Încearcă din nou.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-4xl">
      {saveError && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
          <span className="flex-1">{saveError}</span>
          <button onClick={() => setSaveError(null)} className="opacity-50 hover:opacity-100 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
      <MemorialEditor
        initialData={initialData}
        onSave={handleSave}
        onCancel={() => router.push('/dashboard')}
        saveLabel={saving ? 'Se salvează…' : 'Actualizează Memorialul'}
      />
    </div>
  )
}
