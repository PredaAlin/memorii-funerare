'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { MemorialTheme } from '@/lib/themes'

interface Props {
  urls: string[]
  colors: MemorialTheme['colors']
}

export function ImageGalleryCarousel({ urls, colors: c }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)

  const close = () => setLightboxIndex(null)

  const prev = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i - 1 + urls.length) % urls.length))
  }, [urls.length])

  const next = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i + 1) % urls.length))
  }, [urls.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, prev, next])

  // Prevent body scroll while lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) {
      if (dx < 0) next()
      else prev()
    }
    touchStartX.current = null
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {urls.map((url, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className="aspect-square rounded-xl overflow-hidden cursor-zoom-in group relative"
            style={{ background: c.surface }}
            aria-label={`Deschide imaginea ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              alt=""
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.18)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={close}
        >
          {/* Counter */}
          {urls.length > 1 && (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full tracking-widest"
              style={{ background: c.surface, color: c.textMuted, border: `1px solid ${c.border}` }}
            >
              {lightboxIndex + 1} / {urls.length}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-2xl leading-none font-light"
            style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}` }}
            aria-label="Închide"
          >
            ×
          </button>

          {/* Image — swipeable */}
          <div
            className="flex items-center justify-center w-full h-full px-16 py-12"
            onClick={e => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urls[lightboxIndex]}
              className="rounded-xl shadow-2xl object-contain select-none"
              style={{ maxHeight: '82vh', maxWidth: '88vw' }}
              alt=""
              draggable={false}
            />
          </div>

          {/* Prev / Next arrows */}
          {urls.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}` }}
                aria-label="Imaginea anterioară"
              >
                ‹
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ background: c.surface, color: c.text, border: `1px solid ${c.border}` }}
                aria-label="Imaginea următoare"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
