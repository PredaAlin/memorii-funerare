'use client'

import React, { useState } from 'react'
import { MemorialContent } from '@/types'
import { THEMES, getTheme } from '@/lib/themes'

interface MemorialEditorProps {
  initialData: MemorialContent
  onSave: (data: MemorialContent) => void
  onCancel: () => void
}

export const MemorialEditor: React.FC<MemorialEditorProps> = ({ initialData, onSave, onCancel }) => {
  const [data, setData] = useState<MemorialContent>(initialData)
  const [activeTab, setActiveTab] = useState<'details' | 'tema' | 'media' | 'videos'>('details')

  const maxStorage = data.plan === 'premium' ? 300 : 100
  const currentSize = (data.media.length * 2) + (data.videos.length * 15)
  const progress = (currentSize / maxStorage) * 100

const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files
    if (!files) return
    if (currentSize >= maxStorage) {
      alert('Limita de stocare pentru acest plan a fost atinsă.')
      return
    }
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === 'image') {
          setData(prev => ({ ...prev, media: [...prev.media, reader.result as string] }))
        } else {
          setData(prev => ({ ...prev, videos: [...prev.videos, reader.result as string] }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeMedia = (index: number, type: 'image' | 'video') => {
    setData(prev => ({
      ...prev,
      media: type === 'image' ? prev.media.filter((_, i) => i !== index) : prev.media,
      videos: type === 'video' ? prev.videos.filter((_, i) => i !== index) : prev.videos,
    }))
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-w-4xl w-full">
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
              <span className="text-[10px] text-stone-400 font-mono">{currentSize}/{maxStorage}MB</span>
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
                alert('Videoclipurile sunt disponibile doar în planurile Premium.')
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
                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onloadend = () => setData(prev => ({ ...prev, profilePhoto: reader.result as string }))
                      reader.readAsDataURL(file)
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
                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onloadend = () => setData(prev => ({ ...prev, bannerPhoto: reader.result as string }))
                      reader.readAsDataURL(file)
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
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-stone-100 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} className="w-full h-full object-cover" alt="" />
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
        <button onClick={() => onSave(data)} className="px-10 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-all shadow-md active:scale-95">Salvează Memorial</button>
      </div>
    </div>
  )
}
