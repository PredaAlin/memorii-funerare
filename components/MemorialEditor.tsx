'use client'

import React, { useState } from 'react'
import { upload } from '@vercel/blob/client'
import { MemorialContent } from '@/types'
import { THEMES, getTheme } from '@/lib/themes'
import { MemorialPreview } from '@/components/MemorialPreview'

interface MemorialEditorProps {
  initialData: MemorialContent
  onSave: (data: MemorialContent) => void
  onCancel: () => void
  saveLabel?: string
}

function compressImageToBlob(file: File, maxWidth: number, quality = 0.82): Promise<Blob> {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => resolve(blob!), 'image/jpeg', quality)
    }
    img.src = url
  })
}

async function uploadFile(file: File, maxWidth?: number): Promise<string> {
  // Videos: upload directly from browser to Vercel Blob (bypasses 4.5MB function limit)
  if (file.type.startsWith('video/')) {
    const ext = file.name.split('.').pop() ?? 'mp4'
    const filename = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const blob = await upload(filename, file, { access: 'public', handleUploadUrl: '/api/upload' })
    return blob.url
  }

  // Images: compress first, then upload via server
  const formData = new FormData()
  if (maxWidth) {
    const compressed = await compressImageToBlob(file, maxWidth)
    formData.append('file', compressed, file.name.replace(/\.[^.]+$/, '.jpg'))
  } else {
    formData.append('file', file)
  }
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Upload failed')
  const { url } = await res.json()
  return url as string
}

export const MemorialEditor: React.FC<MemorialEditorProps> = ({ initialData, onSave, onCancel, saveLabel }) => {
  const [data, setData] = useState<MemorialContent>(initialData)
  const [activeTab, setActiveTab] = useState<'details' | 'tema' | 'media' | 'videos'>('details')
  const [uploading, setUploading] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'info' } | null>(null)
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [fileSizes, setFileSizes] = useState<Record<string, number>>({})

  const showToast = (message: string, type: 'error' | 'info' = 'error') => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  const maxStorage = data.plan === 'premium' ? 300 : 100
  const currentSize = [
    ...data.media.map(url => fileSizes[url] ?? 2),
    ...data.videos.map(url => fileSizes[url] ?? 15),
  ].reduce((a, b) => a + b, 0)
  const progress = (currentSize / maxStorage) * 100

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files
    if (!files) return
    if (currentSize >= maxStorage) {
      showToast('Limita de stocare pentru acest plan a fost atinsă.')
      return
    }
    Array.from(files).forEach(async file => {
      const sizeMB = file.size / (1024 * 1024)
      setUploading(n => n + 1)
      try {
        const url = await uploadFile(file, type === 'image' ? 1200 : undefined)
        setFileSizes(prev => ({ ...prev, [url]: sizeMB }))
        if (type === 'image') {
          setData(prev => ({ ...prev, media: [...prev.media, url] }))
        } else {
          setData(prev => ({ ...prev, videos: [...prev.videos, url] }))
        }
      } catch {
        showToast('Încărcarea fișierului a eșuat. Încearcă din nou.')
      } finally {
        setUploading(n => n - 1)
      }
    })
  }

  const removeMedia = (index: number, type: 'image' | 'video') => {
    setData(prev => {
      const removedUrl = type === 'image' ? prev.media[index] : prev.videos[index]
      setFileSizes(sizes => { const next = { ...sizes }; delete next[removedUrl]; return next })
      return {
        ...prev,
        media: type === 'image' ? prev.media.filter((_, i) => i !== index) : prev.media,
        videos: type === 'video' ? prev.videos.filter((_, i) => i !== index) : prev.videos,
      }
    })
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-w-4xl w-full relative">
      {toast && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm w-full mx-4 transition-all ${
          toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-amber-50 border border-amber-200 text-amber-900'
        }`}>
          <span className="text-base">{toast.type === 'error' ? '⚠️' : 'ℹ️'}</span>
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-current opacity-50 hover:opacity-100 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
      <div className="bg-stone-900 text-white p-5 sm:p-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl serif">Designer Memorial</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${data.plan === 'premium' ? 'bg-amber-600' : 'bg-stone-700 text-stone-300'}`}>
              {data.plan} Plan
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                <div className={`h-full transition-all ${progress > 90 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, progress)}%` }}></div>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">{currentSize.toFixed(1)}/{maxStorage}MB</span>
            </div>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="flex border-b border-stone-100 overflow-x-auto no-scrollbar">
        {(['details', 'tema', 'media', 'videos'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              if (tab === 'videos' && data.plan === 'basic') {
                showToast('Videoclipurile sunt disponibile doar în planurile Premium.', 'info')
                return
              }
              setActiveTab(tab)
            }}
            className={`flex-1 min-w-[100px] py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'
            } ${tab === 'videos' && data.plan === 'basic' ? 'opacity-30' : ''}`}
          >
            {tab === 'videos' && <span className="mr-1">📹</span>}
            {tab === 'details' ? 'detalii' : tab === 'tema' ? 'temă' : tab === 'media' ? 'media' : 'videoclipuri'}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-8 min-h-[400px]">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-tighter mb-2">Fotografie Profil</label>
                  <label className="relative flex flex-col items-center justify-center w-full aspect-square rounded-2xl border-2 border-dashed border-stone-200 cursor-pointer hover:bg-stone-50 transition-all group overflow-hidden">
                    <input type="file" className="hidden" accept="image/*" onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploading(n => n + 1)
                      try {
                        const url = await uploadFile(file, 800)
                        setData(prev => ({ ...prev, profilePhoto: url }))
                      } catch { showToast('Încărcarea a eșuat.') }
                      finally { setUploading(n => n - 1) }
                    }} />
                    {data.profilePhoto ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.profilePhoto} className="absolute inset-0 w-full h-full object-cover" alt="" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white uppercase tracking-widest">Schimbă</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-stone-300 group-hover:text-amber-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        <span className="text-[10px] font-bold text-stone-400">ADAUGĂ</span>
                      </>
                    )}
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-tighter mb-2">Fotografie Copertă</label>
                  <label className="relative flex flex-col items-center justify-center w-full aspect-square rounded-2xl border-2 border-dashed border-stone-200 cursor-pointer hover:bg-stone-50 transition-all group overflow-hidden">
                    <input type="file" className="hidden" accept="image/*" onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploading(n => n + 1)
                      try {
                        const url = await uploadFile(file, 1400)
                        setData(prev => ({ ...prev, bannerPhoto: url }))
                      } catch { showToast('Încărcarea a eșuat.') }
                      finally { setUploading(n => n - 1) }
                    }} />
                    {data.bannerPhoto ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.bannerPhoto} className="absolute inset-0 w-full h-full object-cover" alt="" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white uppercase tracking-widest">Schimbă</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-stone-300 group-hover:text-amber-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <span className="text-[10px] font-bold text-stone-400">ADAUGĂ</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-tighter mb-2">Nume Complet</label>
                <input type="text" value={data.deceasedName} onChange={e => setData({ ...data, deceasedName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-tighter mb-2">Răsărit</label>
                  <input type="date" value={data.birthDate} onChange={e => setData({ ...data, birthDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-tighter mb-2">Apus</label>
                  <input type="date" value={data.deathDate} onChange={e => setData({ ...data, deathDate: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-tighter mb-2">Citat Preferat</label>
                <input type="text" value={data.quote} onChange={e => setData({ ...data, quote: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none" placeholder='"O viață bine trăită..."' />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-tighter mb-2">Biografie</label>
              <textarea value={data.bio} onChange={e => setData({ ...data, bio: e.target.value })} className="w-full h-[245px] px-4 py-3 rounded-xl border border-stone-200 outline-none transition-all resize-none" placeholder="Povestește-le viața..." />
            </div>
          </div>
        )}

        {activeTab === 'tema' && (
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-6">Alege o temă vizuală pentru pagina memorială</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {THEMES.map(theme => {
                const c = theme.colors
                const selected = (data.theme ?? 'clasic') === theme.id
                return (
                  <button
                    key={theme.id}
                    onClick={() => setData(prev => ({ ...prev, theme: theme.id }))}
                    className="text-left rounded-2xl overflow-hidden transition-all focus:outline-none"
                    style={{
                      border: selected ? `2px solid ${c.tabActive}` : '2px solid #e7e5e4',
                      boxShadow: selected ? `0 0 0 2px ${c.tabActive}` : undefined,
                    }}
                  >
                    {/* Mini cover simulation */}
                    <div style={{ height: 44, position: 'relative', background: 'linear-gradient(135deg, #aaa 0%, #777 100%)', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, background: c.coverOverlay }} />
                      {/* Simulated profile circle */}
                      <div style={{
                        position: 'absolute', bottom: -10, left: 10,
                        width: 24, height: 24, borderRadius: '50%',
                        background: c.bg, border: `2px solid ${c.profileRing}`,
                      }} />
                    </div>

                    {/* Content preview */}
                    <div style={{ background: c.bg, padding: '16px 10px 8px' }}>
                      {/* Simulated name */}
                      <div style={{ height: 5, background: c.text, borderRadius: 3, width: '75%', marginBottom: 4 }} />
                      {/* Simulated date */}
                      <div style={{ height: 3, background: c.textMuted, borderRadius: 2, width: '55%', marginBottom: 8 }} />
                      {/* Simulated divider */}
                      <div style={{ height: 1, background: c.border, marginBottom: 6 }} />
                      {/* Simulated text lines */}
                      <div style={{ height: 3, background: c.textMuted, borderRadius: 2, marginBottom: 3 }} />
                      <div style={{ height: 3, background: c.textMuted, borderRadius: 2, width: '80%', marginBottom: 3 }} />
                      <div style={{ height: 3, background: c.textMuted, borderRadius: 2, width: '60%' }} />
                    </div>

                    {/* Theme name footer */}
                    <div style={{
                      background: c.bg,
                      borderTop: `1px solid ${c.border}`,
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <span style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: c.text,
                      }}>
                        {theme.name}
                      </span>
                      {selected && (
                        <div style={{
                          width: 14, height: 14, borderRadius: '50%',
                          background: c.tabActive,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <label className="aspect-square border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-all group">
                <input type="file" multiple className="hidden" onChange={e => handleFileUpload(e, 'image')} accept="image/*" />
                <svg className="w-8 h-8 text-stone-300 group-hover:text-amber-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                <span className="text-[10px] font-bold text-stone-400">ADAUGĂ FOTO</span>
              </label>
              {data.media.map((url, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragEnd={() => setDragIndex(null)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex === null || dragIndex === i) return
                    const reordered = [...data.media]
                    reordered.splice(i, 0, reordered.splice(dragIndex, 1)[0])
                    setData(prev => ({ ...prev, media: reordered }))
                    setDragIndex(null)
                  }}
                  className={`relative aspect-square rounded-2xl overflow-hidden group border border-stone-100 shadow-sm cursor-grab active:cursor-grabbing transition-opacity ${dragIndex === i ? 'opacity-40' : ''}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} className="w-full h-full object-cover pointer-events-none" alt="" />
                  {/* Drag handle */}
                  <div className="absolute top-2 left-2 p-1 bg-white/80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-stone-500" viewBox="0 0 16 16" fill="currentColor">
                      <circle cx="5" cy="4" r="1.2"/><circle cx="5" cy="8" r="1.2"/><circle cx="5" cy="12" r="1.2"/>
                      <circle cx="11" cy="4" r="1.2"/><circle cx="11" cy="8" r="1.2"/><circle cx="11" cy="12" r="1.2"/>
                    </svg>
                  </div>
                  <button onClick={() => removeMedia(i, 'image')} className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <label className="aspect-square border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-all group">
                <input type="file" multiple className="hidden" onChange={e => handleFileUpload(e, 'video')} accept="video/*" />
                <svg className="w-8 h-8 text-stone-300 group-hover:text-amber-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                <span className="text-[10px] font-bold text-stone-400">ADAUGĂ VIDEO</span>
              </label>
              {data.videos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-stone-100 shadow-sm bg-stone-900">
                  <video src={url} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168l4.74 3.555a1 1 0 010 1.615l-4.74 3.555A1 1 0 018 15.115V8.115a1 1 0 011.555-.832z"/></svg>
                  </div>
                  <button onClick={() => removeMedia(i, 'video')} className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="bg-stone-50 p-6 flex justify-end gap-4 border-t border-stone-100">
        <button onClick={onCancel} className="px-6 py-3 text-stone-500 font-bold hover:text-stone-800 transition-colors">Anulare</button>
        <button
          onClick={() => setShowPreview(true)}
          className="px-6 py-3 border border-stone-300 text-stone-700 rounded-full font-bold hover:bg-stone-100 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          Previzualizare
        </button>
        <button
          onClick={() => onSave(data)}
          disabled={uploading > 0}
          className="px-10 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-wait"
        >
          {uploading > 0 ? `Se încarcă (${uploading})…` : (saveLabel ?? 'Salvează Memorial')}
        </button>
      </div>

      {/* Live preview modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setShowPreview(false)}
        >
          <div onClick={e => e.stopPropagation()} className="relative flex flex-col items-center">
            <button
              onClick={() => setShowPreview(false)}
              className="mb-4 px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition-colors"
            >
              ✕ Închide previzualizarea
            </button>
            <MemorialPreview data={data} />
          </div>
        </div>
      )}
    </div>
  )
}
