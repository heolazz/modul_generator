// MassPushModul/components/CoverPreview.tsx
import React, { forwardRef } from 'react';
import { CoverConfig, CategoryShape } from '../types';
import { IconBook } from './IconBook';

interface CoverPreviewProps {
  config: CoverConfig;
}

export const CoverPreview = forwardRef<HTMLDivElement, CoverPreviewProps>(({ config }, ref) => {
  
  const containerStyle = {
    fontFamily: `'${config.fontFamily}', sans-serif`,
    textRendering: 'optimizeLegibility' as const, 
    WebkitFontSmoothing: 'antialiased'
  };

  // --- 1. CLASSIC LAYOUT ---
  if (config.layout === 'classic') {
      return <div className="p-10 text-center bg-gray-100">Classic Layout Placeholder</div>;
  }

  // --- 2. MODERN CLEAN SPLIT (FIXED) ---
  if (config.layout === 'modern') {
    return (
       <div 
         ref={ref} 
         className="relative w-[800px] h-[450px] overflow-hidden flex"
         style={containerStyle}
       >
          
          {/* === BAGIAN KIRI: IMAGE FULL (FIXED WIDTH) === */}
          <div 
             className="relative shrink-0 overflow-hidden h-full bg-slate-200" 
             style={{
                 width: `${config.sideRectWidth}px`, 
             }}
          >
              {config.bottomImageUrl ? (
                 <img 
                    src={config.bottomImageUrl} 
                    className="w-full h-full object-cover transform scale-105" 
                    style={{
                        transform: `translateX(${config.sideImageOffsetX}px) scale(1.1)` 
                    }}
                 />
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                     <IconBook className="w-24 h-24 opacity-50" />
                  </div>
              )}
          </div>

          {/* === BAGIAN KANAN: KONTAINER UTAMA === */}
          <div 
            className="flex-1 relative flex flex-col justify-between z-10 p-10"
            style={{
                backgroundColor: config.primaryColor 
            }}
          >
              
              {/* LOGO */}
              <div 
                 className="absolute"
                 style={{ 
                     top: '40px', 
                     right: '40px',
                     transform: `translate(${config.logoPositionX}px, ${config.logoPositionY}px)` 
                 }}
              >
                 {config.logoUrl ? (
                     <img src={config.logoUrl} alt="Logo" className="object-contain filter brightness-0 invert drop-shadow-md" style={{ width: `${config.logoWidth}px` }} />
                 ) : (
                     <h2 className="text-white font-bold text-2xl tracking-tight">LINKUMKM</h2>
                 )}
              </div>

              {/* === GRUP 1: KONTEN ATAS === */}
              <div 
                className="flex flex-col items-start mt-4" 
                style={{ transform: `translateY(${config.contentPositionY}px)` }}
              >
                
                {/* 1. KATEGORI (DENGAN PENGATURAN POSISI Y INDEPENDEN) */}
                <div 
                    className="mb-5"
                    style={{ transform: `translateY(${config.categoryPositionY}px)` }} // <--- FITUR BARU
                >
                    <span 
                        className="px-3 py-1 uppercase tracking-widest font-bold text-[10px] shadow-sm"
                        style={{
                            backgroundColor: config.categoryBgColor, 
                            color: config.categoryTextColor,     
                            borderRadius: '4px',
                        }}
                    >
                        {config.category}
                    </span>
                </div>

                {/* 2. JUDUL UTAMA */}
                <h1 
                    className="mb-3 leading-tight"
                    style={{ 
                        fontSize: `${config.titleFontSize}px`,
                        color: '#ffffff', 
                        fontWeight: config.titleFontWeight,
                        letterSpacing: `${config.titleLetterSpacing}em`,
                        maxWidth: '90%'
                    }}
                >
                    {config.title}
                </h1>

                {/* 3. GARIS DEKORASI */}
                <div 
                    className="flex flex-col items-start"
                    style={{ 
                        transform: `translateY(${config.separatorPositionY}px)` 
                    }}
                >
                    {Array.from({ length: config.separatorLineCount }).map((_, i) => (
                    <div 
                        key={i} 
                        style={{
                            width: `${80 + (i * 20)}px`, 
                            height: `${config.separatorLineHeight}px`,
                            backgroundColor: config.accentColor, 
                            marginBottom: `${config.separatorLineSpacing}px`
                        }}
                    />
                    ))}
                </div>

              </div>
              
              {/* === GRUP 2: FOOTER (SPEAKER) === */}
              <div className="mt-auto pt-8 border-t border-white/20 w-full relative z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-white shrink-0">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-100 uppercase tracking-widest font-semibold mb-0.5">Pembicara</p>
                            <p className="text-white font-bold text-base leading-none">
                                {config.speakerName || "Nama Pembicara"}
                            </p>
                        </div>
                    </div>
              </div>

          </div>
       </div>
    );
  }

  return <div>Layout Not Found</div>;
});

CoverPreview.displayName = 'CoverPreview';