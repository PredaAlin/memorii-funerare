
import React, { useState } from 'react';
import { MemorialContent } from '../types';
import { getTheme } from '@/lib/themes';

interface MemorialPreviewProps {
  data: MemorialContent;
}

export const MemorialPreview: React.FC<MemorialPreviewProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'gallery' | 'videos'>('info');

  const formatDate = (dateString: string) => {
    if (!dateString) return '...';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const theme = getTheme(data.theme);
  const c = theme.colors;

  return (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl overflow-hidden">
      <div className="rounded-[2rem] overflow-hidden w-full h-full relative flex flex-col" style={{ background: c.bg }}>
        {/* Notch / Status Bar */}
        <div className="h-6 w-full flex justify-between px-6 items-center text-[10px] font-bold text-gray-400 shrink-0">
            <span>9:41</span>
            <div className="w-20 h-4 bg-gray-800 rounded-b-2xl absolute left-1/2 -translate-x-1/2 top-0"></div>
            <div className="flex gap-1 items-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto scroll-smooth no-scrollbar" style={{ background: c.bg }}>
          {/* Cover Photo */}
          <div className="h-32 w-full overflow-hidden relative" style={{ background: '#b0b0b0' }}>
            {(data.bannerPhoto || data.media[0]) ? (
              <img src={data.bannerPhoto || data.media[0]} className="w-full h-full object-cover grayscale-[30%]" alt="Cover" />
            ) : (
              <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #b0b0b0 0%, #888 100%)' }} />
            )}
            <div className="absolute inset-0" style={{ background: c.coverOverlay }}></div>
          </div>

          <div className="px-5 -mt-8 relative z-10">
            <div
              className="w-16 h-16 rounded-full p-1 shadow-lg border-2 overflow-hidden mb-3"
              style={{ background: c.bg, borderColor: c.profileRing }}
            >
              <img src={data.profilePhoto || data.media[0] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"} className="w-full h-full object-cover rounded-full" />
            </div>
            <h3 className="text-md font-bold serif uppercase tracking-widest" style={{ color: c.text }}>{data.deceasedName || "Nume Complet"}</h3>
            <div className="flex items-center gap-2 mt-1 text-[8px] font-bold uppercase tracking-tighter" style={{ color: c.textMuted }}>
              <span>{formatDate(data.birthDate)}</span>
              <span className="w-1 h-1 rounded-full" style={{ background: c.tabActive }}></span>
              <span>{formatDate(data.deathDate)}</span>
            </div>
          </div>

          {/* Inline Navigation Tabs */}
          <div className="flex px-5 mt-6 gap-6" style={{ borderBottom: `1px solid ${c.border}` }}>
            {(['info', 'gallery', 'videos'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="pb-2 text-[10px] font-bold uppercase tracking-widest transition-all"
                style={activeTab === tab
                  ? { color: c.tabActive, borderBottom: `2px solid ${c.tabActive}` }
                  : { color: c.tabInactive }}
              >
                {tab === 'info' ? 'info' : tab === 'gallery' ? 'galerie' : 'videoclipuri'}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'info' && (
              <div className="animate-fadeIn">
                {data.quote && (
                  <div
                    className="px-4 py-3 rounded-xl italic text-[10px] leading-relaxed mb-6"
                    style={{ background: c.surfaceAlt, border: `1px solid ${c.borderAlt}`, color: c.text }}
                  >
                    "{data.quote}"
                  </div>
                )}
                <h4
                  className="text-[8px] font-bold uppercase tracking-widest mb-2 pb-1"
                  style={{ color: c.sectionHeading, borderBottom: `1px solid ${c.border}` }}
                >
                  Biografie
                </h4>
                <p className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: c.text }}>
                  {data.bio || "Povestea urmează să fie spusă..."}
                </p>
                <div className="mt-12 flex flex-col items-center gap-3 opacity-30">
                  <div className="w-16 h-16 p-2 rounded-lg shadow-sm" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <svg className="w-full h-full" style={{ color: c.border }} viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2z" fill="currentColor"/></svg>
                  </div>
                  <p className="text-[8px] uppercase font-bold tracking-widest" style={{ color: c.textMuted }}>Memorial QR Linked</p>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                {data.media.length > 0 ? data.media.map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden" style={{ background: c.surface }}>
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                )) : (
                  <p className="col-span-2 text-center text-[10px] py-10" style={{ color: c.textMuted }}>Nicio fotografie adăugată încă.</p>
                )}
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-3 animate-fadeIn">
                {data.videos.length > 0 ? data.videos.map((vid, i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden relative shadow-lg" style={{ background: '#111' }}>
                    <video src={vid} controls className="w-full h-full object-cover" />
                  </div>
                )) : (
                  <p className="text-center text-[10px] py-10" style={{ color: c.textMuted }}>Niciun videoclip adăugat încă.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Phone UI Footer */}
        <div className="h-10 w-full flex items-center justify-center shrink-0" style={{ borderTop: `1px solid ${c.border}`, background: c.bg }}>
          <div className="w-24 h-1 rounded-full" style={{ background: c.border }}></div>
        </div>
      </div>
    </div>
  );
};
