// MassPushModul/App.tsx
import React, { useState, useRef, useEffect } from 'react';
import { CoverPreview } from './components/CoverPreview';
import { EditorPanel } from './components/EditorPanel';
import { CoverConfig, DEFAULT_CONFIG, CATEGORIES_DATA, getContrastColor, PRIMARY_BG_COLORS } from './types';
import { toPng, toJpeg } from 'html-to-image';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { 
  Download, ChevronDown, Loader2, ZoomIn, ZoomOut, 
  Maximize, Minimize, Monitor, CheckCircle2 
} from 'lucide-react';

// Helper: Tunggu gambar benar-benar loaded sebelum capture
const waitForImages = (element: HTMLElement): Promise<void[]> => {
    const images = Array.from(element.querySelectorAll('img'));
    if (images.length === 0) return Promise.resolve([]);

    const promises = images.map(img => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise<void>(resolve => {
            const timer = setTimeout(() => resolve(), 1500); 
            img.onload = () => { clearTimeout(timer); resolve(); };
            img.onerror = () => { clearTimeout(timer); resolve(); };
        });
    });
    return Promise.all(promises);
};

function App() {
  const [config, setConfig] = useState<CoverConfig>(DEFAULT_CONFIG);
  
  // State UI & Export
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string>('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportQuality, setExportQuality] = useState<number>(2);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  
  // State Display
  const [zoomLevel, setZoomLevel] = useState<number>(0.8); // Default agak kecil agar muat
  const [isFullscreen, setIsFullscreen] = useState(false);

  // State Bulk
  const [bulkData, setBulkData] = useState<Partial<CoverConfig>[]>([]);
  const [currentBulkIndex, setCurrentBulkIndex] = useState<number>(0);
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
  const [imageAssets, setImageAssets] = useState<Record<string, string>>({});

  const previewRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null); // Ref untuk area full screen

  // --- FULL SCREEN LOGIC ---
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        workspaceRef.current?.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
        setIsFullscreen(true);
    } else {
        document.exitFullscreen();
        setIsFullscreen(false);
    }
  };

  // Listen change (misal user tekan ESC)
  useEffect(() => {
      const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener('fullscreenchange', handleFsChange);
      return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // --- FIT TO SCREEN LOGIC ---
  const handleFitScreen = () => {
      // Logika sederhana: set zoom agar pas di layar laptop standar
      setZoomLevel(0.90); 
  };

  // --- LOGIC ASSET ---
  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newAssets: Record<string, string> = { ...imageAssets };
    Array.from(files).forEach(file => { 
        newAssets[file.name] = URL.createObjectURL(file); 
    });
    setImageAssets(newAssets);
    alert(`${files.length} gambar berhasil dimuat.`);
  };

  const handleRemoveAsset = (filename: string) => { 
      const newAssets = { ...imageAssets };
      delete newAssets[filename];
      setImageAssets(newAssets);
  };
  
  // --- BULK UPLOAD EXCEL ---
  const handleBulkUpload = async (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        let missingImagesCount = 0;

        const mappedData: Partial<CoverConfig>[] = jsonData.map((row: any) => {
          const title = row['Title'] || row['Judul'] || row['title'] || DEFAULT_CONFIG.title;
          const category = row['Category'] || row['Kategori'] || row['category'] || DEFAULT_CONFIG.category;
          const level = row['Level'] || row['level'] || row['SubCategory'] || DEFAULT_CONFIG.level;
          const speakerName = row['Speaker'] || row['Pembicara'] || row['speaker'] || DEFAULT_CONFIG.speakerName;
  
          const logoFilenameStr = String(row['LogoFile'] || row['Logo'] || '').trim();
          let logoUrl = DEFAULT_CONFIG.logoUrl;
          if (logoFilenameStr && imageAssets[logoFilenameStr]) {
              logoUrl = imageAssets[logoFilenameStr];
          }

          const sideImageFilenameStr = String(
              row['Filename'] || row['Side Image'] || row['SideImage'] || row['Left Side Image'] || row['Left Image'] || row['Gambar Kiri'] || row['SideImageFile'] || ''
          ).trim();
  
          let bottomImageUrl = null; 
          if (sideImageFilenameStr) {
              if (imageAssets[sideImageFilenameStr]) {
                  bottomImageUrl = imageAssets[sideImageFilenameStr];
              } else {
                  missingImagesCount++;
                  console.warn(`[Missing Image] Excel minta: "${sideImageFilenameStr}", tapi tidak ada di Assets.`);
              }
          }
  
          const preset = CATEGORIES_DATA.find(c => c.name.toLowerCase() === String(category).toLowerCase());
          const primaryColor = PRIMARY_BG_COLORS[0]; 
          const accentColor = preset ? preset.color : DEFAULT_CONFIG.accentColor;
          
          return { 
              title, category, level, speakerName, 
              primaryColor, accentColor, 
              categoryBgColor: accentColor, 
              categoryTextColor: getContrastColor(accentColor), 
              logoUrl, 
              bottomImageUrl 
          };
        });
  
        if (mappedData.length > 0) {
          setBulkData(mappedData);
          setIsBulkMode(true);
          setCurrentBulkIndex(0);
          setConfig(prev => ({ ...prev, ...mappedData[0] }));
          
          let msg = `Berhasil load ${mappedData.length} data.`;
          if (missingImagesCount > 0) {
              msg += `\n⚠️ Peringatan: Ada ${missingImagesCount} gambar yang disebut di Excel tapi belum Anda upload di Assets.`;
          }
          alert(msg);
        } else {
            alert('File Excel kosong atau format tidak terbaca.');
        }
      };
      reader.readAsArrayBuffer(file);
  };

  // --- EXPORT LOGIC ---
  const handleExport = async () => {
    if (previewRef.current === null) return;
    setIsDownloading(true);
    setShowExportMenu(false);

    if (isBulkMode) {
        // Bulk Download
        const zip = new JSZip();
        const folder = zip.folder("covers");
        let successCount = 0;
        
        try {
          const currentZoom = zoomLevel;
          setZoomLevel(1); // Reset zoom for capture
          await new Promise(r => setTimeout(r, 200)); // Give time to render

          for (let i = 0; i < bulkData.length; i++) {
            setDownloadProgress(`Processing ${i + 1} of ${bulkData.length}...`);
            const item = bulkData[i];
            setConfig(prev => ({ ...prev, ...item }));
            await new Promise(resolve => setTimeout(resolve, 200));
            await waitForImages(previewRef.current);
    
            try {
                const dataUrl = await toPng(previewRef.current, { cacheBust: false, pixelRatio: exportQuality, skipAutoScale: true });
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                if (blob && folder) {
                    // Bersihkan Judul dan Kategori
                    const cleanTitle = (item.title || 'cover').replace(/[^a-z0-9]/gi, '_').substring(0, 50);
                    const cleanCategory = (item.category || 'category').replace(/[^a-z0-9]/gi, '_').substring(0, 30);
                    
                    // Format: 1_Judul_Kategori.png
                    folder.file(`${i + 1}_${cleanTitle}_${cleanCategory}.png`, blob); 
                    successCount++;
                }
            } catch (rowError) { console.error(`Row ${i} fail:`, rowError); }
          }
          setDownloadProgress('Zipping...');
          const content = await zip.generateAsync({ type: "blob" });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = "batch_covers.zip";
          link.click();
          alert(`Selesai! ${successCount} gambar berhasil.`);
          
          setZoomLevel(currentZoom); // Restore zoom

        } catch (err) {
          alert('Error saat batch export.');
        } finally {
          setIsDownloading(false);
          setDownloadProgress('');
        }

    } else {
        // Single Download
        try {
            setDownloadProgress('Generating...');
            
            const prevZoom = zoomLevel;
            setZoomLevel(1);
            await new Promise(r => setTimeout(r, 100));

            await waitForImages(previewRef.current);
            const options = { cacheBust: false, pixelRatio: exportQuality, backgroundColor: '#ffffff' };
            let dataUrl;
            if (exportFormat === 'jpeg') dataUrl = await toJpeg(previewRef.current, options);
            else dataUrl = await toPng(previewRef.current, options);
            
           const link = document.createElement('a');

            // Bersihkan Judul dan Kategori dari karakter aneh agar aman untuk nama file
            const cleanTitle = (config.title || 'untitled').replace(/[^a-z0-9]/gi, '_').substring(0, 50);
            const cleanCategory = (config.category || 'category').replace(/[^a-z0-9]/gi, '_').substring(0, 30);

            // Format: Judul_Kategori.png
            link.download = `${cleanTitle}_${cleanCategory}.${exportFormat}`;
            link.href = dataUrl;
            link.click();

            setZoomLevel(prevZoom);
        } catch (err) {
            console.error(err);
            alert('Gagal download.');
        } finally {
            setIsDownloading(false);
            setDownloadProgress('');
        }
    }
  };

  return (
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
        
        {/* LEFT SIDEBAR */}
        <EditorPanel 
            config={config} 
            onChange={setConfig} 
            isBulkMode={isBulkMode}
            onBulkUpload={handleBulkUpload}
            onBulkNavigate={(dir) => {
                if (!bulkData.length) return;
                let newIndex = dir === 'next' ? currentBulkIndex + 1 : currentBulkIndex - 1;
                if (newIndex < 0) newIndex = 0;
                if (newIndex >= bulkData.length) newIndex = bulkData.length - 1;
                setCurrentBulkIndex(newIndex);
                setConfig(prev => ({ ...prev, ...bulkData[newIndex] }));
            }}
            currentBulkIndex={currentBulkIndex}
            totalBulkItems={bulkData.length}
            onAssetUpload={handleAssetUpload}
            assets={imageAssets}
            onRemoveAsset={handleRemoveAsset}
            onReset={() => {
                setConfig(DEFAULT_CONFIG);
                setIsBulkMode(false);
                setBulkData([]);
                setImageAssets({});
            }}
        />

        {/* RIGHT MAIN AREA */}
        {/* Ref ini untuk Full Screen Container */}
        <div ref={workspaceRef} className="flex-1 flex flex-col relative h-full bg-slate-100">
            
            {/* HEADER (Floating Glass) */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex justify-between items-center px-6 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-blue-200 shadow-lg">
                        M
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-slate-800 tracking-tight leading-none">
                            Modul<span className="text-blue-600">Gen</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium border border-slate-200">v2.0 Beta</span>
                            {isBulkMode && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold border border-green-200 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3"/> Bulk Active
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="flex bg-slate-800 text-white rounded-lg shadow-xl shadow-slate-400/20 transition-transform hover:scale-[1.02]">
                        <button 
                            onClick={handleExport}
                            disabled={isDownloading}
                            className="flex items-center gap-2 px-5 py-2 font-semibold text-sm border-r border-white/10 hover:bg-white/10 rounded-l-lg disabled:opacity-70 transition-colors"
                        >
                            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4" />}
                            {isDownloading ? 'Processing...' : (isBulkMode ? 'Download ZIP' : 'Download')}
                        </button>
                        
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={isDownloading}
                            className="px-2.5 hover:bg-white/10 rounded-r-lg transition-colors border-l border-black/20"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Export Menu Dropdown */}
                    {showExportMenu && (
                        <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 p-5 z-50 animate-in fade-in slide-in-from-top-2 ring-1 ring-black/5">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Export Settings</p>
                            
                            {!isBulkMode && (
                                <div className="mb-5">
                                    <label className="text-xs font-semibold text-slate-700 block mb-2">Format</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => setExportFormat('png')} className={`py-2 text-xs font-medium rounded-lg border transition-all ${exportFormat === 'png' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>PNG</button>
                                        <button onClick={() => setExportFormat('jpeg')} className={`py-2 text-xs font-medium rounded-lg border transition-all ${exportFormat === 'jpeg' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>JPEG</button>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-semibold text-slate-700 block mb-2">Resolution</label>
                                <select 
                                    value={exportQuality}
                                    onChange={(e) => setExportQuality(Number(e.target.value))}
                                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={1}>1x (Standard - 800px)</option>
                                    <option value={2}>2x (High Res - 1600px)</option>
                                    <option value={4}>4x (Ultra Print - 3200px)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* PREVIEW CANVAS AREA */}
            <div 
                className="flex-1 flex items-center justify-center p-8 overflow-hidden relative"
                style={{
                    backgroundColor: '#F8FAFC',
                    backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            >
                {/* Canvas Wrapper */}
                <div 
                    className="relative transition-transform duration-300 ease-out origin-center shadow-2xl rounded-sm ring-1 ring-black/5 bg-white"
                    style={{ transform: `scale(${zoomLevel})` }}
                >
                    {isDownloading && (
                        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-sm">
                            <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin"/> {downloadProgress || 'Rendering...'}
                            </div>
                        </div>
                    )}
                    
                    <CoverPreview ref={previewRef} config={config} />
                </div>

                {/* FLOATING CONTROLS (ZOOM & FULL SCREEN) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-slate-200 p-1.5 rounded-full shadow-xl flex items-center gap-1 z-30 transition-all hover:scale-105">
                    
                    {/* Zoom Controls */}
                    <button 
                        onClick={() => setZoomLevel(Math.max(0.2, zoomLevel - 0.1))} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    
                    <span className="w-12 text-center text-xs font-bold text-slate-700 select-none font-mono">
                        {Math.round(zoomLevel * 100)}%
                    </span>
                    
                    <button 
                        onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.1))} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>

                    <div className="w-px h-4 bg-slate-300 mx-1"></div>

                    {/* Fit Screen */}
                    <button 
                        onClick={handleFitScreen} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-full transition-colors"
                        title="Fit to Screen"
                    >
                        <Monitor className="w-4 h-4" />
                    </button>

                    {/* Full Screen Toggle (WORKING) */}
                    <button 
                        onClick={toggleFullScreen} 
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isFullscreen ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
                        title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                    >
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                </div>

            </div>

        </div>
      </div>
  );
}

export default App;