// MassPushModul/components/EditorPanel.tsx
import React, { useState, useEffect } from 'react';
import { CoverConfig, FONT_OPTIONS, FONT_WEIGHT_OPTIONS, PRIMARY_BG_COLORS, CATEGORIES_DATA, getContrastColor } from '../types';
import { 
  Settings, Image as ImageIcon, Layout, Type, Palette, Check, RefreshCcw, 
  BoxSelect, User, MoveHorizontal, FileSpreadsheet, ChevronLeft, ChevronRight, 
  HelpCircle, Trash2, ChevronDown, ChevronUp, Upload, Save, Download 
} from 'lucide-react';

interface EditorPanelProps {
  config: CoverConfig;
  onChange: (config: CoverConfig) => void;
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

// --- COMPONENTS KECIL ---

const Section = ({ title, icon: Icon, children, isOpen, onToggle }: { title: string; icon: any; children: React.ReactNode, isOpen: boolean, onToggle: () => void }) => (
  <div className="border-b border-slate-100 last:border-0">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors text-left group outline-none"
    >
      <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
        <div className={`p-1.5 rounded-md ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:text-blue-500'}`}>
           {Icon && <Icon className="w-4 h-4" />}
        </div>
        {title}
      </div>
      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400"/> : <ChevronDown className="w-4 h-4 text-slate-400"/>}
    </button>
    
    {isOpen && (
       <div className="p-4 pt-0">
         {children}
       </div>
    )}
  </div>
);

const Label = ({ children, badge }: { children: React.ReactNode, badge?: string }) => (
  <div className="flex justify-between items-center mb-2">
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{children}</label>
    {badge && <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] px-1.5 py-0.5 rounded font-bold">{badge}</span>}
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
    <button 
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-all ${
            active 
            ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
        }`}
    >
        {Icon && <Icon className="w-4 h-4" />}
        {label}
    </button>
);

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
    config, onChange, isBulkMode, onBulkUpload, onBulkNavigate, currentBulkIndex, totalBulkItems, onAssetUpload, assets, onRemoveAsset, onReset 
}) => {
  
  // State UI
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
      'datasource': true,
      'content': true,
      'assets': true,
      'layout': false,
      'typography': false,
      'colors': true
  });
  const [showHelp, setShowHelp] = useState(false);

  // --- PRESET SYSTEM ---
  const savePreset = () => {
      const presetName = prompt("Nama Preset (misal: 'Tema Merah'):");
      if(presetName) {
          localStorage.setItem(`preset_${presetName}`, JSON.stringify(config));
          alert(`Preset '${presetName}' tersimpan!`);
      }
  };

  const loadPreset = () => {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('preset_'));
      if (keys.length === 0) {
          alert("Belum ada preset tersimpan.");
          return;
      }
      
      const names = keys.map(k => k.replace('preset_', ''));
      const chosen = prompt(`Ketik nama preset yang mau diload:\n\n${names.join('\n')}`);
      
      if (chosen) {
          const saved = localStorage.getItem(`preset_${chosen}`);
          if (saved) {
              try {
                  onChange(JSON.parse(saved));
              } catch(e) { alert("Gagal load preset."); }
          } else {
              alert("Preset tidak ditemukan.");
          }
      }
  };
  // ---------------------

  const toggleSection = (key: string) => {
      setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
    <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
            <Label>{label}</Label>
            <input 
                type="number" 
                value={value} 
                onChange={handleRangeChange} 
                name={name}
                className="w-12 h-6 text-[10px] text-center border border-slate-200 rounded bg-slate-50 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
            />
        </div>
        <div className="flex items-center gap-3">
            <input 
                type="range" name={name} min={min} max={max} step={step} value={value || 0} 
                onChange={handleRangeChange} 
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
            />
        </div>
    </div>
  );

  return (
    <div className="w-[400px] bg-white border-r border-slate-200 h-screen flex flex-col shadow-xl z-30 font-sans">
      
      {/* HEADER */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
        <div>
           <h2 className="font-bold text-slate-900 text-lg tracking-tight">Editor Panel</h2>
           <div className="flex gap-2 mt-1">
               {/* TOMBOL PRESET BARU */}
               <button onClick={savePreset} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                   <Save className="w-3 h-3"/> Save
               </button>
               <button onClick={loadPreset} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                   <Download className="w-3 h-3"/> Load
               </button>
           </div>
        </div>
        <button 
            onClick={onReset} 
            className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-500 rounded-full transition-all group border border-slate-200 hover:border-red-200" 
            title="Reset All to Default"
        >
            <RefreshCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500"/>
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 bg-white sticky top-[88px] z-20">
          <TabButton 
             active={activeTab === 'content'} 
             onClick={() => setActiveTab('content')} 
             icon={BoxSelect} 
             label="Data & Content" 
          />
          <TabButton 
             active={activeTab === 'design'} 
             onClick={() => setActiveTab('design')} 
             icon={Palette} 
             label="Design & Style" 
          />
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        
        {/* ================= TAB 1: CONTENT ================= */}
        {activeTab === 'content' && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                
                {/* 1. DATA SOURCE (EXCEL) */}
                <Section 
                    title="Data Source (Bulk)" 
                    icon={FileSpreadsheet} 
                    isOpen={openSections['datasource']} 
                    onToggle={() => toggleSection('datasource')}
                >
                    <div className="space-y-3">
                        <div className={`p-4 rounded-xl border-2 border-dashed transition-all ${isBulkMode ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300'}`}>
                            <Label>{isBulkMode ? 'Excel Aktif' : 'Upload Excel (.xlsx)'}</Label>
                            <input 
                                type="file" 
                                accept=".xlsx, .xls" 
                                onChange={(e) => e.target.files?.[0] && onBulkUpload?.(e.target.files[0])}
                                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-white file:text-blue-600 hover:file:bg-blue-50 cursor-pointer"
                            />
                            {isBulkMode && (
                                <div className="mt-2 text-[10px] text-green-700 font-medium flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Data Loaded
                                </div>
                            )}
                        </div>

                        {/* Toggle Help */}
                        <div>
                            <button onClick={() => setShowHelp(!showHelp)} className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                                <HelpCircle className="w-3.5 h-3.5" />
                                {showHelp ? 'Tutup Info Format' : 'Lihat Format Kolom Excel'}
                            </button>
                            {showHelp && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 text-[10px] text-slate-700 shadow-sm">
                                    <p className="mb-2 font-bold text-blue-900">Header Kolom Wajib:</p>
                                    <ul className="space-y-1 pl-3 list-disc marker:text-blue-400">
                                        <li>Title / Judul</li>
                                        <li>Category / Kategori</li>
                                        <li>Speaker / Pembicara</li>
                                        <li>Side Image / Filename <span className="text-slate-400">(Isi: foto.jpg)</span></li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Navigation Bulk */}
                        {isBulkMode && (
                        <div className="flex items-center justify-between bg-slate-800 text-white p-3 rounded-lg shadow-md mt-2">
                            <button onClick={() => onBulkNavigate?.('prev')} className="p-1.5 hover:bg-slate-600 rounded-md transition-colors"><ChevronLeft className="w-4 h-4"/></button>
                            <div className="text-center">
                                <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Data ke</span>
                                <div className="text-sm font-bold">{ (currentBulkIndex || 0) + 1 } <span className="text-slate-500 font-normal">/</span> { totalBulkItems }</div>
                            </div>
                            <button onClick={() => onBulkNavigate?.('next')} className="p-1.5 hover:bg-slate-600 rounded-md transition-colors"><ChevronRight className="w-4 h-4"/></button>
                        </div>
                        )}
                    </div>
                </Section>

                {/* 2. TEXT CONTENT */}
                <Section 
                    title="Text Content" 
                    icon={Type} 
                    isOpen={openSections['content']} 
                    onToggle={() => toggleSection('content')}
                >
                    <div className="space-y-4">
                        <div>
                            <Label>Judul Modul</Label>
                            <textarea 
                                name="title" rows={3} value={config.title} onChange={handleChange} 
                                className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none font-medium bg-slate-50 focus:bg-white transition-all shadow-sm"
                                placeholder="Masukkan judul..."
                            />
                        </div>
                        
                        <div>
                            <Label badge="Wajib">Nama Pembicara</Label>
                            <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-sm">
                                <User className="w-4 h-4 text-slate-400" />
                                <input type="text" name="speakerName" value={config.speakerName} onChange={handleChange} placeholder="Nama Pembicara..." className="w-full text-sm outline-none bg-transparent"/>
                            </div>
                        </div>

                        <div>
                            <Label>Kategori</Label>
                            <div className="relative">
                                <select 
                                    name="category" 
                                    className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm font-medium text-slate-700"
                                    value={config.category}
                                    onChange={(e) => {
                                        const selectedName = e.target.value;
                                        const selectedData = CATEGORIES_DATA.find(c => c.name === selectedName);
                                        if (selectedData) {
                                            onChange({ ...config, category: selectedData.name, categoryBgColor: selectedData.color, categoryTextColor: getContrastColor(selectedData.color), accentColor: selectedData.color });
                                        } else { onChange({ ...config, category: selectedName }); }
                                    }}
                                >
                                    <option value="" disabled>Pilih Kategori...</option>
                                    {Array.from(new Set(CATEGORIES_DATA.map(c => c.group))).map(groupName => (
                                        <optgroup key={groupName} label={groupName}>
                                            {CATEGORIES_DATA.filter(c => c.group === groupName).map(c => (
                                                <option key={c.name} value={c.name}>{c.name}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </Section>

                {/* 3. ASSETS MANAGER */}
                <Section 
                    title="Asset Images" 
                    icon={ImageIcon} 
                    isOpen={openSections['assets']} 
                    onToggle={() => toggleSection('assets')}
                >
                     <div className="space-y-4">
                         
                         {/* Uploader */}
                         <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <Label>Upload Assets (Bulk)</Label>
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-2" />
                                    <p className="text-[10px] text-slate-500"><span className="font-semibold">Click to upload</span> multiple images</p>
                                </div>
                                <input type="file" multiple accept="image/*" onChange={onAssetUpload} className="hidden" />
                            </label>
                         
                            {/* List Assets */}
                            {assets && Object.keys(assets).length > 0 && (
                                <div className="mt-4">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Gallery</span>
                                        <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{Object.keys(assets).length} files</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                        {Object.entries(assets).map(([name, url]) => (
                                            <div key={name} className="relative group rounded-md overflow-hidden border border-slate-200 aspect-square bg-white shadow-sm">
                                                <img src={url} alt={name} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                                    <p className="text-[9px] text-white truncate w-full mb-1">{name}</p>
                                                    <button 
                                                        onClick={() => onRemoveAsset?.(name)}
                                                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600 w-full flex justify-center shadow"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                         </div>

                         <div className="border-t border-slate-100 pt-4">
                            <Label>Manual Upload (Single)</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[10px] text-slate-400 block mb-1">Logo (Top Right)</span>
                                    <input type="file" accept="image/*" onChange={handleFileChange('logoUrl')} className="block w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-100 file:text-slate-600"/>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block mb-1">Side Image (Left)</span>
                                    <input type="file" accept="image/*" onChange={handleFileChange('bottomImageUrl')} className="block w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-100 file:text-slate-600"/>
                                </div>
                            </div>
                         </div>
                     </div>
                </Section>

            </div>
        )}

        {/* ================= TAB 2: DESIGN ================= */}
        {activeTab === 'design' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* 1. LAYOUT SETTINGS */}
                <Section 
                    title="Layout & Geometry" 
                    icon={Layout} 
                    isOpen={openSections['layout']} 
                    onToggle={() => toggleSection('layout')}
                >
                    <div className="space-y-5">
                        <div className="p-1 bg-slate-100 rounded-lg flex gap-1">
                            <button 
                                onClick={() => onChange({ ...config, layout: 'modern' })}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${config.layout === 'modern' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Modern Split
                            </button>
                            <button 
                                onClick={() => onChange({ ...config, layout: 'classic' })}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${config.layout === 'classic' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Classic
                            </button>
                        </div>

                        {config.layout === 'modern' && (
                            <div className="space-y-1">
                                <Label badge="Left Side">Image Area Configuration</Label>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <SliderWithInput label="Width (px)" name="sideRectWidth" min={200} max={600} step={10} value={config.sideRectWidth} />
                                    <SliderWithInput label="Image Offset X" name="sideImageOffsetX" min={-300} max={300} step={5} value={config.sideImageOffsetX} />
                                </div>

                                <div className="mt-4">
                                    <Label badge="Decoration">Accent Lines</Label>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <SliderWithInput label="Count" name="separatorLineCount" min={0} max={5} value={config.separatorLineCount} />
                                        <SliderWithInput label="Position Y" name="separatorPositionY" min={-50} max={50} value={config.separatorPositionY} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Section>

                {/* 2. TYPOGRAPHY */}
                <Section 
                    title="Typography" 
                    icon={Type} 
                    isOpen={openSections['typography']} 
                    onToggle={() => toggleSection('typography')}
                >
                    <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Font Family</Label>
                                <select 
                                    name="fontFamily" 
                                    value={config.fontFamily} 
                                    onChange={handleChange} 
                                    className="w-full text-xs p-2 border rounded-md bg-white font-sans"
                                    style={{ fontFamily: config.fontFamily }} // Font preview di dropdown
                                >
                                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label>Title Weight</Label>
                                <select name="titleFontWeight" value={config.titleFontWeight} onChange={handleChange} className="w-full text-xs p-2 border rounded-md bg-white">
                                    {FONT_WEIGHT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                            </div>
                         </div>
                         
                         <div className="border-t border-slate-100 pt-4">
                            <Label badge="Position">Vertical Adjustment</Label>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <SliderWithInput label="Content Block Y" name="contentPositionY" min={-200} max={200} value={config.contentPositionY} />
                                <SliderWithInput label="Category Label Y" name="categoryPositionY" min={-50} max={100} value={config.categoryPositionY} />
                            </div>
                         </div>

                         <div className="border-t border-slate-100 pt-4">
                            <Label badge="Size">Title Styling</Label>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <SliderWithInput label="Font Size" name="titleFontSize" min={20} max={80} value={config.titleFontSize} />
                                <SliderWithInput label="Line Height" name="titleLineHeight" min={0.8} max={2.0} step={0.05} value={config.titleLineHeight} />
                            </div>
                         </div>
                    </div>
                </Section>
                
                {/* 3. COLORS & CUSTOM PICKER */}
                <Section 
                    title="Colors & Theme" 
                    icon={Palette} 
                    isOpen={openSections['colors']} 
                    onToggle={() => toggleSection('colors')}
                >
                     <div className="space-y-4">
                         <div>
                            <Label>Background Theme</Label>
                            
                            {/* PRESET COLORS */}
                            <div className="flex gap-2 flex-wrap mb-3">
                                {PRIMARY_BG_COLORS.map((color) => (
                                    <button 
                                        key={color} 
                                        onClick={() => onChange({ ...config, primaryColor: color })} 
                                        className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-all ${config.primaryColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105 hover:shadow-md'}`} 
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    >
                                        {config.primaryColor === color && <Check className="w-4 h-4 text-white/90" />}
                                    </button>
                                ))}
                            </div>

                            {/* CUSTOM COLOR PICKER */}
                            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm border border-slate-300">
                                    <input 
                                        type="color" 
                                        name="primaryColor"
                                        value={config.primaryColor} 
                                        onChange={handleChange}
                                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                                    />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Custom Hex</span>
                                    <span className="text-xs font-mono text-slate-700">{config.primaryColor}</span>
                                </div>
                            </div>

                         </div>
                     </div>
                </Section>

                {/* 4. ASSET PROPERTIES */}
                <Section title="Asset Properties" icon={Settings} isOpen={openSections['assets']} onToggle={() => toggleSection('assets')}>
                   <div className="space-y-2">
                       {config.logoUrl && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <Label badge="Logo">Logo Settings</Label>
                            <SliderWithInput label="Size" name="logoWidth" min={50} max={300} value={config.logoWidth} />
                            <SliderWithInput label="Pos X" name="logoPositionX" min={-100} max={200} value={config.logoPositionX} />
                            <SliderWithInput label="Pos Y" name="logoPositionY" min={-100} max={200} value={config.logoPositionY} />
                        </div>
                       )}
                   </div>
                </Section>

            </div>
        )}
      </div>
    </div>
  );
};