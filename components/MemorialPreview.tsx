
import React, { useState } from 'react';
import { MemorialContent } from '../types';

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

  return (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl overflow-hidden">
      <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative flex flex-col">
        {/* Notch / Status Bar */}
        <div className="h-6 w-full flex justify-between px-6 items-center text-[10px] font-bold text-gray-400 shrink-0">
            <span>9:41</span>
            <div className="w-20 h-4 bg-gray-800 rounded-b-2xl absolute left-1/2 -translate-x-1/2 top-0"></div>
            <div className="flex gap-1 items-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto scroll-smooth bg-white no-scrollbar">
          {/* Cover Photo */}
          <div className="h-32 w-full bg-stone-200 overflow-hidden relative">
            {(data.bannerPhoto || data.media[0]) ? (
              <img src={data.bannerPhoto || data.media[0]} className="w-full h-full object-cover grayscale-[30%]" alt="Cover" />
            ) : (
              <div className="w-full h-full bg-stone-200" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent"></div>
          </div>

          <div className="px-5 -mt-8 relative z-10">
            <div className="w-16 h-16 bg-white rounded-full p-1 shadow-lg border-2 border-amber-100 overflow-hidden mb-3">
              <img src={data.profilePhoto || data.media[0] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"} className="w-full h-full object-cover rounded-full" />
            </div>
            <h3 className="text-md font-bold text-stone-800 serif uppercase tracking-widest">{data.deceasedName || "Nume Complet"}</h3>
            <div className="flex items-center gap-2 mt-1 text-stone-500 text-[8px] font-bold uppercase tracking-tighter">
              <span>{formatDate(data.birthDate)}</span>
              <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
              <span>{formatDate(data.deathDate)}</span>
            </div>
          </div>

          {/* Inline Navigation Tabs */}
          <div className="flex px-5 mt-6 border-b border-stone-100 gap-6">
            {(['info', 'gallery', 'videos'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab 
                  ? 'text-stone-900 border-b-2 border-stone-900' 
                  : 'text-stone-400'
                }`}
              >
                {tab === 'info' ? 'info' : tab === 'gallery' ? 'galerie' : 'videoclipuri'}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'info' && (
              <div className="animate-fadeIn">
                {data.quote && (
                  <div className="px-4 py-3 bg-amber-50 rounded-xl italic text-stone-600 text-[10px] border border-amber-100 leading-relaxed mb-6">
                    "{data.quote}"
                  </div>
                )}
                <h4 className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mb-2 border-b border-stone-200 pb-1">Biografie</h4>
                <p className="text-stone-700 text-[11px] leading-relaxed whitespace-pre-wrap">
                  {data.bio || "Povestea urmează să fie spusă..."}
                </p>
                <div className="mt-12 flex flex-col items-center gap-3 opacity-30">
                  <div className="w-16 h-16 p-2 bg-white border border-stone-100 rounded-lg shadow-sm">
                    <svg className="w-full h-full text-stone-300" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2z" fill="currentColor"/></svg>
                  </div>
                  <p className="text-[8px] text-stone-400 uppercase font-bold tracking-widest">Memorial QR Linked</p>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                {data.media.length > 0 ? data.media.map((img, i) => (
                  <div key={i} className="aspect-square bg-stone-100 rounded-lg overflow-hidden">
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                )) : (
                  <p className="col-span-2 text-center text-stone-400 text-[10px] py-10">Nicio fotografie adăugată încă.</p>
                )}
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-3 animate-fadeIn">
                {data.videos.length > 0 ? data.videos.map((vid, i) => (
                  <div key={i} className="aspect-video bg-stone-900 rounded-xl overflow-hidden relative shadow-lg">
                    <video src={vid} controls className="w-full h-full object-cover" />
                  </div>
                )) : (
                  <p className="text-center text-stone-400 text-[10px] py-10">Niciun videoclip adăugat încă.</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Phone UI Footer */}
        <div className="h-10 w-full flex items-center justify-center shrink-0 border-t border-stone-50 bg-white">
          <div className="w-24 h-1 bg-stone-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
