// MassPushModul/components/EditorPanel.tsx
import React from 'react';
import { CoverConfig, FONT_OPTIONS, FONT_WEIGHT_OPTIONS, PRIMARY_BG_COLORS, CATEGORIES_DATA, getContrastColor, DEFAULT_CONFIG } from '../types';
import { Settings, Image as ImageIcon, Layout, Type, Palette, Check, RefreshCcw, BoxSelect, User, MoveHorizontal, FileSpreadsheet, ChevronLeft, ChevronRight, Upload } from 'lucide-react';

interface EditorPanelProps {
  config: CoverConfig;
  onChange: (config: CoverConfig) => void;
  // Props Bulk Mode (Tetap dipertahankan)
  isBulkMode?: boolean;
  onBulkUpload?: (file: File) => void;
  onBulkNavigate?: (direction: 'next' | 'prev') => void;
  currentBulkIndex?: number;
  totalBulkItems?: number;
  onAssetUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  assets?: Record<string, string>;
  onRemoveAsset?: (name: string) => void;
  onReset?: () => void;
}

const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="mb-6 border-b border-slate-100 pb-6 last:border-0">
    <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold text-sm uppercase tracking-wider">
      <Icon className="w-4 h-4 text-blue-500" />
      {title}
    </div>
    {children}
  </div>
);

const Label = ({ children, badge }: { children: React.ReactNode, badge?: string }) => (
  <div className="flex justify-between items-center mb-1.5">
    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{children}</label>
    {badge && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">{badge}</span>}
  </div>
);

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
    config, onChange, isBulkMode, onBulkUpload, onBulkNavigate, currentBulkIndex, totalBulkItems, onAssetUpload, assets, onReset 
}) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...config, [name]: value });
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...config, [name]: parseFloat(value) });
  };

  const handleFileChange = (key: keyof CoverConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({ ...config, [key]: url });
    }
  };

  const SliderWithInput = ({ label, name, min, max, step = 1, value }: { label: string, name: keyof CoverConfig, min: number, max: number, step?: number, value: number }) => (
    <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
            <Label>{label}</Label>
        </div>
        <div className="flex items-center gap-3">
            <input type="range" name={name} min={min} max={max} step={step} value={value} onChange={handleRangeChange} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
            <div className="relative">
                <input type="number" name={name} value={value} step={step} onChange={handleRangeChange} className="w-16 h-7 text-xs text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
        </div>
    </div>
  );

  return (
    <div className="w-[380px] bg-white border-l border-slate-200 h-screen overflow-y-auto custom-scrollbar shadow-xl z-50 flex flex-col">
      
      {/* HEADER */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
        <div>
           <h2 className="font-bold text-slate-800 text-lg">Editor</h2>
           <p className="text-xs text-slate-500">Customize cover style</p>
        </div>
        <button onClick={onReset} className="p-2 hover:bg-slate-200 rounded-full transition-colors group" title="Reset All">
            <RefreshCcw className="w-4 h-4 text-slate-500 group-hover:rotate-180 transition-transform duration-500"/>
        </button>
      </div>

      <div className="p-5 space-y-2">
        
        {/* --- BULK MODE CONTROLS (JIKA ADA) --- */}
        <Section title="Data Source" icon={FileSpreadsheet}>
            <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <Label>Upload Excel</Label>
                    <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        onChange={(e) => e.target.files?.[0] && onBulkUpload?.(e.target.files[0])}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                {isBulkMode && (
                   <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-100">
                      <button onClick={() => onBulkNavigate?.('prev')} className="p-1 hover:bg-white rounded shadow-sm"><ChevronLeft className="w-4 h-4 text-blue-600"/></button>
                      <span className="text-xs font-bold text-blue-800">Item { (currentBulkIndex || 0) + 1 } / { totalBulkItems }</span>
                      <button onClick={() => onBulkNavigate?.('next')} className="p-1 hover:bg-white rounded shadow-sm"><ChevronRight className="w-4 h-4 text-blue-600"/></button>
                   </div>
                )}
            </div>
        </Section>

        {/* --- CONTENT --- */}
        <Section title="Content" icon={Type}>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <Label badge="NEW">Layout Template</Label>
                <select name="layout" value={config.layout} onChange={handleChange} className="w-full text-sm p-2 border border-blue-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="classic">Classic Style</option>
                    <option value="modern">Modern Clean Split</option>
                </select>
            </div>
            <div>
              <Label>Title</Label>
              <textarea name="title" rows={3} value={config.title} onChange={handleChange} className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium"/>
            </div>
            <div>
               <Label badge="Wajib">Speaker Name</Label>
               <div className="flex items-center gap-2 border border-slate-200 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500">
                  <User className="w-4 h-4 text-slate-400" />
                  <input type="text" name="speakerName" value={config.speakerName} onChange={handleChange} placeholder="Nama Pembicara..." className="w-full text-sm outline-none"/>
               </div>
            </div>

            {/* --- NEW CATEGORY SELECTOR WITH GROUPS --- */}
            <div>
               <Label>Category</Label>
               <select 
                  name="category" 
                  className="w-full text-sm p-2 border border-slate-200 rounded-md bg-white outline-none"
                  value={config.category}
                  onChange={(e) => {
                      const selectedName = e.target.value;
                      const selectedData = CATEGORIES_DATA.find(c => c.name === selectedName);
                      if (selectedData) {
                          onChange({ 
                              ...config, 
                              category: selectedData.name, 
                              categoryBgColor: selectedData.color,        
                              categoryTextColor: getContrastColor(selectedData.color), 
                              accentColor: selectedData.color             
                          });
                      } else {
                          onChange({ ...config, category: selectedName });
                      }
                  }}
               >
                  <option value="" disabled>Pilih Kategori...</option>
                  {/* GROUPING LOGIC */}
                  {Array.from(new Set(CATEGORIES_DATA.map(c => c.group))).map(groupName => (
                      <optgroup key={groupName} label={groupName} className="font-bold text-slate-600 bg-slate-50">
                          {CATEGORIES_DATA.filter(c => c.group === groupName).map(c => (
                              <option key={c.name} value={c.name} className="font-normal text-slate-800 bg-white">
                                  {c.name}
                              </option>
                          ))}
                      </optgroup>
                  ))}
               </select>
            </div>
          </div>
        </Section>

        {/* --- IMAGE SETTINGS (MODERN LAYOUT) --- */}
        {config.layout === 'modern' && (
            <Section title="Split & Position" icon={MoveHorizontal}>
                <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <Label badge="Left Side">Image Area</Label>
                        <div className="mt-2 space-y-2">
                            <SliderWithInput label="Area Width" name="sideRectWidth" min={200} max={600} step={10} value={config.sideRectWidth} />
                            <SliderWithInput label="Image Shift X" name="sideImageOffsetX" min={-200} max={200} step={5} value={config.sideImageOffsetX} />
                        </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <Label badge="Right Side">Decoration Lines</Label>
                        <div className="mt-2 space-y-2">
                            <SliderWithInput label="Count" name="separatorLineCount" min={0} max={10} value={config.separatorLineCount} />
                            <SliderWithInput label="Thickness" name="separatorLineHeight" min={1} max={20} value={config.separatorLineHeight} />
                            <SliderWithInput label="Spacing" name="separatorLineSpacing" min={1} max={30} value={config.separatorLineSpacing} />
                            <SliderWithInput label="Pos Y" name="separatorPositionY" min={-100} max={100} step={5} value={config.separatorPositionY} />
                        </div>
                    </div>
                </div>
            </Section>
        )}

       {/* --- TYPOGRAPHY & COLORS & ASSETS --- */}
        <Section title="Typography" icon={Layout}>
            <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label>Font</Label>
                        <select name="fontFamily" value={config.fontFamily} onChange={handleChange} className="w-full text-sm p-2 border rounded-md bg-white">
                            {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <Label>Title Weight</Label>
                        <select name="titleFontWeight" value={config.titleFontWeight} onChange={handleChange} className="w-full text-sm p-2 border rounded-md bg-white">
                            {FONT_WEIGHT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                    </div>
                 </div>
                 
                 {/* --- POSISI KONTEN UTAMA --- */}
                 <div className="border-t border-slate-100 pt-3 mt-2">
                    <Label badge="Position">Layout Adjustment</Label>
                    <div className="mt-3 space-y-2">
                        {/* Menggeser SEMUA (Kategori + Judul) */}
                        <SliderWithInput label="Content Block Y" name="contentPositionY" min={-200} max={200} value={config.contentPositionY} />
                        
                        {/* Menggeser KATEGORI SAJA (Fitur Baru) */}
                        <SliderWithInput label="Category Only Y" name="categoryPositionY" min={-50} max={100} value={config.categoryPositionY} />
                    </div>
                 </div>

                 {/* --- FONT SIZE --- */}
                 <div className="border-t border-slate-100 pt-3 mt-2">
                    <Label badge="Title">Title Font</Label>
                    <div className="mt-3 space-y-2">
                        <SliderWithInput label="Size" name="titleFontSize" min={20} max={80} value={config.titleFontSize} />
                        <SliderWithInput label="Line Height" name="titleLineHeight" min={0.8} max={2.0} step={0.05} value={config.titleLineHeight} />
                    </div>
                 </div>
            </div>
        </Section>
        <Section title="Colors" icon={Palette}>
             <div className="space-y-4">
                 <div>
                    <Label>Theme Color (Right Side)</Label>
                    <div className="flex gap-2">
                        {PRIMARY_BG_COLORS.map((color) => (
                            <button key={color} onClick={() => onChange({ ...config, primaryColor: color })} className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-all ${config.primaryColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: color }}>
                                {config.primaryColor === color && <Check className="w-4 h-4 text-white" />}
                            </button>
                        ))}
                    </div>
                 </div>
             </div>
        </Section>
        <Section title="Assets" icon={ImageIcon}>
             <div className="space-y-4">
                 {/* Asset Manager untuk Bulk Mode */}
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <Label>Upload Assets (Bulk)</Label>
                    <input type="file" multiple accept="image/*" onChange={onAssetUpload} className="block w-full text-xs text-slate-500 mb-2"/>
                    <p className="text-[10px] text-slate-400">Upload logo/gambar yang namanya sesuai dengan Excel.</p>
                 </div>

                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <Label>Logo (Top Right)</Label>
                    <input type="file" accept="image/*" onChange={handleFileChange('logoUrl')} className="block w-full text-xs text-slate-500 mb-2"/>
                    {config.logoUrl && (
                        <div className="space-y-2">
                            <SliderWithInput label="Size" name="logoWidth" min={50} max={300} value={config.logoWidth} />
                            <SliderWithInput label="Pos X" name="logoPositionX" min={-100} max={200} value={config.logoPositionX} />
                            <SliderWithInput label="Pos Y" name="logoPositionY" min={-100} max={200} value={config.logoPositionY} />
                        </div>
                    )}
                 </div>
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <Label>Left Side Image</Label>
                    <input type="file" accept="image/*" onChange={handleFileChange('bottomImageUrl')} className="block w-full text-xs text-slate-500 mb-2"/>
                 </div>
             </div>
        </Section>
      </div>
    </div>
  );
};