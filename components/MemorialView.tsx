'use client'

import { useEffect, useState } from 'react'
import { getTheme } from '@/lib/themes'
import { ImageGalleryCarousel } from '@/components/ImageGalleryCarousel'
import { FamilyTree } from '@/components/FamilyTree'
import type { FamilyMember } from '@/types'

interface Tribute {
  id: string
  authorName: string
  relationship: string | null
  body: string
  createdAt: string
}

interface MemorialData {
  deceasedName: string
  birthDate: string | null
  deathDate: string | null
  bio: string | null
  quote: string | null
  mediaUrls: string[]
  videoUrls: string[]
  profilePhotoUrl?: string | null
  bannerPhotoUrl?: string | null
  theme?: string | null
  id: string
  candlesEnabled: boolean
  memoriesEnabled: boolean
  candleCount: number
  tributes: Tribute[]
  familyTreeEnabled: boolean
  familyTree: FamilyMember | null
}

interface MemorialViewProps {
  memorial: MemorialData
  isOwner?: boolean
}

function formatDate(dateString: string | null) {
  if (!dateString) return '...'
  return new Date(dateString).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function MemorialView({ memorial, isOwner = false }: MemorialViewProps) {
  const coverPhoto = memorial.bannerPhotoUrl || memorial.mediaUrls[0]
  const profilePhoto = memorial.profilePhotoUrl || memorial.mediaUrls[0]
  const c = getTheme(memorial.theme).colors

  const tabs = [
    { id: 'info' as const, label: 'Info' },
    ...(memorial.mediaUrls.length > 0 ? [{ id: 'galerie' as const, label: 'Galerie' }] : []),
    ...(memorial.videoUrls.length > 0 ? [{ id: 'videoclipuri' as const, label: 'Videoclipuri' }] : []),
    ...(memorial.memoriesEnabled ? [{ id: 'amintiri' as const, label: 'Amintiri' }] : []),
  ]

  const [activeTab, setActiveTab] = useState<'info' | 'galerie' | 'videoclipuri' | 'amintiri'>(tabs[0].id)

  return (
    <div className="min-h-screen" style={{ background: c.bg }}>
      {/* Cover */}
      <div className="h-56 w-full overflow-hidden relative" style={{ background: '#c8c8c8' }}>
        {coverPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPhoto} className="w-full h-full object-cover grayscale-[20%]" alt="Cover" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #b0b0b0 0%, #888 100%)' }} />
        )}
        <div className="absolute inset-0" style={{ background: c.coverOverlay }} />
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-16 relative z-10">
        {/* Profile */}
        <div
          className="w-24 h-24 rounded-full p-1 shadow-xl border-2 overflow-hidden mb-4"
          style={{ background: c.bg, borderColor: c.profileRing }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profilePhoto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop'}
            className="w-full h-full object-cover rounded-full"
            alt={memorial.deceasedName}
          />
        </div>

        <h1 className="text-3xl font-bold serif uppercase tracking-widest mb-1" style={{ color: c.text }}>
          {memorial.deceasedName}
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: c.textMuted }}>
          {formatDate(memorial.birthDate)} &bull; {formatDate(memorial.deathDate)}
        </p>

        {/* Candle widget */}
        {memorial.candlesEnabled && (
          <CandleWidget memorialId={memorial.id} initialCount={memorial.candleCount} colors={c} />
        )}

        {/* Tab bar */}
        <div
          className="flex gap-8 sticky top-0 z-20 -mx-6 px-6 py-3 overflow-x-auto no-scrollbar"
          style={{ background: c.bg, borderBottom: `1px solid ${c.border}` }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="pb-1 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap"
              style={activeTab === tab.id
                ? { color: c.tabActive, borderBottom: `2px solid ${c.tabActive}` }
                : { color: c.tabInactive }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="py-8 pb-16">
          {activeTab === 'info' && (
            <div>
              {memorial.quote && (
                <div
                  className="rounded-2xl px-6 py-4 italic text-sm leading-relaxed mb-8"
                  style={{ background: c.surfaceAlt, border: `1px solid ${c.borderAlt}`, color: c.text }}
                >
                  &ldquo;{memorial.quote}&rdquo;
                </div>
              )}
              {memorial.bio && (
                <div>
                  <h2
                    className="text-xs font-bold uppercase tracking-widest mb-3 pb-2"
                    style={{ color: c.sectionHeading, borderBottom: `1px solid ${c.border}` }}
                  >
                    Biografie
                  </h2>
                  <p className="leading-relaxed whitespace-pre-wrap" style={{ color: c.text }}>{memorial.bio}</p>
                </div>
              )}
              {memorial.familyTreeEnabled && memorial.familyTree && (
                <div className="mt-8">
                  <h2
                    className="text-xs font-bold uppercase tracking-widest mb-3 pb-2"
                    style={{ color: c.sectionHeading, borderBottom: `1px solid ${c.border}` }}
                  >
                    Arbore genealogic
                  </h2>
                  <FamilyTree tree={memorial.familyTree} colors={c} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'galerie' && (
            <ImageGalleryCarousel urls={memorial.mediaUrls} colors={c} />
          )}

          {activeTab === 'videoclipuri' && (
            <div className="space-y-4">
              {memorial.videoUrls.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden shadow-lg" style={{ background: '#111' }}>
                  <video src={url} controls className="w-full" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'amintiri' && (
            <TributesSection
              memorialId={memorial.id}
              initialTributes={memorial.tributes}
              isOwner={isOwner}
              colors={c}
            />
          )}
        </div>

        {/* Footer watermark */}
        <div className="pt-8 pb-8 flex items-center justify-center gap-2 opacity-40" style={{ borderTop: `1px solid ${c.border}` }}>
          <div className="w-4 h-4 rounded-sm rotate-45 flex items-center justify-center" style={{ background: c.text }}>
            <div className="w-2 h-2 border border-white rotate-[-45deg]"></div>
          </div>
          <span className="text-xs font-bold tracking-widest serif" style={{ color: c.textMuted }}>ETERNAL MEMORIES</span>
        </div>
      </div>
    </div>
  )
}

type ThemeColors = ReturnType<typeof getTheme>['colors']

function CandleWidget({ memorialId, initialCount, colors: c }: { memorialId: string; initialCount: number; colors: ThemeColors }) {
  const [count, setCount] = useState(initialCount)
  const [lit, setLit] = useState(false)
  const [busy, setBusy] = useState(false)

  // Reflect a prior light from this browser
  useEffect(() => {
    if (localStorage.getItem(`em_candle_${memorialId}`)) setLit(true)
  }, [memorialId])

  const light = async () => {
    if (lit || busy) return
    setBusy(true)
    setCount(n => n + 1)
    setLit(true)
    try {
      const res = await fetch(`/api/memorials/${memorialId}/candle`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (typeof data.candleCount === 'number') setCount(data.candleCount)
        localStorage.setItem(`em_candle_${memorialId}`, '1')
      } else {
        // Roll back optimistic update on failure
        setCount(n => Math.max(0, n - 1))
        setLit(false)
      }
    } catch {
      setCount(n => Math.max(0, n - 1))
      setLit(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="rounded-2xl px-6 py-5 mb-6 flex items-center gap-4"
      style={{ background: c.surfaceAlt, border: `1px solid ${c.borderAlt}` }}
    >
      <div className="text-4xl leading-none" style={{ filter: lit ? 'none' : 'grayscale(0.6)' }}>🕯️</div>
      <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: c.text }}>
          {count} {count === 1 ? 'lumânare aprinsă' : 'lumânări aprinse'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: c.textMuted }}>
          {lit ? 'Ai aprins o lumânare. Mulțumim.' : 'Aprinde o lumânare în memoria sa.'}
        </p>
      </div>
      <button
        onClick={light}
        disabled={lit || busy}
        className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
        style={{ background: c.tabActive, color: '#fff' }}
      >
        {lit ? 'Aprinsă' : 'Aprinde'}
      </button>
    </div>
  )
}

function formatTributeDate(iso: string) {
  return new Date(iso).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })
}

function TributesSection({ memorialId, initialTributes, isOwner, colors: c }: {
  memorialId: string
  initialTributes: Tribute[]
  isOwner: boolean
  colors: ThemeColors
}) {
  const [tributes, setTributes] = useState(initialTributes)
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setFeedback(null)
    if (!message.trim()) {
      setFeedback({ type: 'error', text: 'Scrie un mesaj.' })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/memorials/${memorialId}/tributes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName: name, relationship, body: message }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error ?? 'Trimiterea a eșuat. Încearcă din nou.' })
        return
      }
      setTributes(prev => [data, ...prev])
      setName('')
      setRelationship('')
      setMessage('')
      setFeedback({ type: 'success', text: 'Mulțumim. Amintirea ta a fost adăugată.' })
    } catch {
      setFeedback({ type: 'error', text: 'Trimiterea a eșuat. Încearcă din nou.' })
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id: string) => {
    const prev = tributes
    setTributes(t => t.filter(x => x.id !== id))
    try {
      const res = await fetch(`/api/memorials/${memorialId}/tributes/${id}`, { method: 'DELETE' })
      if (!res.ok) setTributes(prev)
    } catch {
      setTributes(prev)
    }
  }

  return (
    <div>
      {/* Submit form */}
      <form onSubmit={submit} className="rounded-2xl p-5 mb-8" style={{ background: c.surfaceAlt, border: `1px solid ${c.borderAlt}` }}>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: c.sectionHeading }}>
          Țin minte când…
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={60}
            placeholder="Numele tău (opțional)"
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
          />
          <input
            type="text"
            value={relationship}
            onChange={e => setRelationship(e.target.value)}
            maxLength={40}
            placeholder="Relația (opțional) — ex: Fiul"
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
          />
        </div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Împărtășește o amintire dragă…"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-3"
          style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
        />
        {feedback && (
          <p className="text-xs mb-3" style={{ color: feedback.type === 'error' ? '#dc2626' : c.tabActive }}>
            {feedback.text}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
          style={{ background: c.tabActive, color: '#fff' }}
        >
          {submitting ? 'Se trimite…' : 'Adaugă amintirea'}
        </button>
      </form>

      {/* List */}
      {tributes.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: c.textMuted }}>
          Fii primul care lasă o amintire.
        </p>
      ) : (
        <div className="space-y-4">
          {tributes.map(t => (
            <div key={t.id} className="rounded-2xl px-5 py-4" style={{ background: c.surfaceAlt, border: `1px solid ${c.borderAlt}` }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-bold" style={{ color: c.text }}>
                    {t.authorName}
                    {t.relationship && (
                      <span className="font-normal" style={{ color: c.textMuted }}> · {t.relationship}</span>
                    )}
                  </p>
                  <p className="text-[11px] uppercase tracking-widest" style={{ color: c.textMuted }}>
                    {formatTributeDate(t.createdAt)}
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={() => remove(t.id)}
                    className="text-[11px] font-bold uppercase tracking-widest shrink-0"
                    style={{ color: '#dc2626' }}
                  >
                    Șterge
                  </button>
                )}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: c.text }}>{t.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
