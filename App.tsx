// MassPushModul/App.tsx
import React, { useState, useRef } from 'react';
import { CoverPreview } from './components/CoverPreview';
import { EditorPanel } from './components/EditorPanel';
import { CoverConfig, DEFAULT_CONFIG, CATEGORIES_DATA, getContrastColor, PRIMARY_BG_COLORS } from './types';
import { toPng, toJpeg } from 'html-to-image';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { Download, ChevronDown, Loader2 } from 'lucide-react';

// Helper: Tunggu gambar benar-benar loaded
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
  
  // State Export
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string>('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportQuality, setExportQuality] = useState<number>(2);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  
  // State Bulk
  const [bulkData, setBulkData] = useState<Partial<CoverConfig>[]>([]);
  const [currentBulkIndex, setCurrentBulkIndex] = useState<number>(0);
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
  const [imageAssets, setImageAssets] = useState<Record<string, string>>({});

  const previewRef = useRef<HTMLDivElement>(null);

  // --- LOGIC ASSET ---
  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newAssets: Record<string, string> = { ...imageAssets };
    Array.from(files).forEach(file => { 
        // Simpan nama file persis apa adanya
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
  
  // --- BULK UPLOAD EXCEL (FIXED) ---
  const handleBulkUpload = async (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Baca data JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        let missingImagesCount = 0;

        const mappedData: Partial<CoverConfig>[] = jsonData.map((row: any) => {
          // Mapping kolom (Case insensitive / Support berbagai nama kolom)
          const title = row['Title'] || row['Judul'] || row['title'] || DEFAULT_CONFIG.title;
          const category = row['Category'] || row['Kategori'] || row['category'] || DEFAULT_CONFIG.category;
          const level = row['Level'] || row['level'] || row['SubCategory'] || DEFAULT_CONFIG.level;
          const speakerName = row['Speaker'] || row['Pembicara'] || row['speaker'] || DEFAULT_CONFIG.speakerName;
  
          // --- DETEKSI LOGO ---
          const logoFilenameStr = String(row['LogoFile'] || row['Logo'] || '').trim();
          let logoUrl = DEFAULT_CONFIG.logoUrl;
          if (logoFilenameStr && imageAssets[logoFilenameStr]) {
              logoUrl = imageAssets[logoFilenameStr];
          }

          // --- FIX DETEKSI SIDE IMAGE (LEFT SIDE IMAGE) ---
          // Kita cari nama file gambar dari berbagai kemungkinan nama kolom
          const sideImageFilenameStr = String(
              row['Filename'] ||           // <--- Cek kolom 'Filename'
              row['Side Image'] || 
              row['SideImage'] || 
              row['Left Side Image'] ||    // <--- Cek kolom 'Left Side Image'
              row['Left Image'] || 
              row['Gambar Kiri'] ||
              row['SideImageFile'] || 
              ''
          ).trim();
  
          // PENTING: Di layout Modern, gambar kiri menggunakan variabel 'bottomImageUrl'
          let bottomImageUrl = null; 

          if (sideImageFilenameStr) {
              if (imageAssets[sideImageFilenameStr]) {
                  // Jika gambar ditemukan di asset yg diupload
                  bottomImageUrl = imageAssets[sideImageFilenameStr];
              } else {
                  // Jika nama ada di Excel, tapi file belum diupload
                  missingImagesCount++;
                  console.warn(`[Missing Image] Excel minta: "${sideImageFilenameStr}", tapi tidak ada di Assets.`);
              }
          }
  
          // Auto Color based on Category Name
          const preset = CATEGORIES_DATA.find(c => c.name.toLowerCase() === String(category).toLowerCase());
          const primaryColor = PRIMARY_BG_COLORS[0]; 
          const accentColor = preset ? preset.color : DEFAULT_CONFIG.accentColor;
          
          return { 
              title, category, level, speakerName, 
              primaryColor, accentColor, 
              categoryBgColor: accentColor, 
              categoryTextColor: getContrastColor(accentColor), 
              logoUrl, 
              bottomImageUrl // <--- FIX: Assign ke bottomImageUrl agar muncul di kiri
          };
        });
  
        if (mappedData.length > 0) {
          setBulkData(mappedData);
          setIsBulkMode(true);
          setCurrentBulkIndex(0);
          setConfig(prev => ({ ...prev, ...mappedData[0] }));
          
          let msg = `Berhasil load ${mappedData.length} data.`;
          if (missingImagesCount > 0) {
              msg += `\n⚠️ Peringatan: Ada ${missingImagesCount} gambar yang disebut di Excel tapi belum Anda upload di Assets. Cek console (F12) untuk detail namanya.`;
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
        // Bulk Download Logic
        const zip = new JSZip();
        const folder = zip.folder("covers");
        let successCount = 0;
        
        try {
          for (let i = 0; i < bulkData.length; i++) {
            setDownloadProgress(`Processing ${i + 1} of ${bulkData.length}...`);
            const item = bulkData[i];
            setConfig(prev => ({ ...prev, ...item }));
            await new Promise(resolve => setTimeout(resolve, 250));
            await waitForImages(previewRef.current);
    
            try {
                const dataUrl = await toPng(previewRef.current, { cacheBust: false, pixelRatio: exportQuality, skipAutoScale: true });
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                if (blob && folder) {
                    const cleanTitle = (item.title || 'cover').replace(/[^a-z0-9]/gi, '_').substring(0, 50);
                    folder.file(`${i + 1}_${cleanTitle}.png`, blob);
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
        } catch (err) {
          alert('Error saat batch export.');
        } finally {
          setIsDownloading(false);
          setDownloadProgress('');
        }

    } else {
        // Single Download Logic
        try {
            setDownloadProgress('Generating...');
            await waitForImages(previewRef.current);
            const options = { cacheBust: false, pixelRatio: exportQuality, backgroundColor: '#ffffff' };
            let dataUrl;
            if (exportFormat === 'jpeg') dataUrl = await toJpeg(previewRef.current, options);
            else dataUrl = await toPng(previewRef.current, options);
            
            const link = document.createElement('a');
            link.download = `cover-${Date.now()}.${exportFormat}`;
            link.href = dataUrl;
            link.click();
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
      <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
        
        {/* SIDEBAR */}
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

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col relative">
            
            {/* HEADER */}
            <div className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shadow-sm z-20">
                <h1 className="font-bold text-xl text-slate-800 tracking-tight">
                    Modul<span className="text-blue-600">Cover</span>Generator
                </h1>

                <div className="relative">
                    <div className="flex bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-all">
                        <button 
                            onClick={handleExport}
                            disabled={isDownloading}
                            className="flex items-center gap-2 px-4 py-2 font-semibold text-sm border-r border-blue-500 rounded-l-lg disabled:opacity-70"
                        >
                            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4" />}
                            {isDownloading ? 'Exporting...' : (isBulkMode ? 'Download ZIP' : 'Download Cover')}
                        </button>
                        
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={isDownloading}
                            className="px-2 hover:bg-blue-800 rounded-r-lg transition-colors"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    {showExportMenu && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Export Settings</p>
                            {!isBulkMode && (
                                <div className="mb-4">
                                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Format</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setExportFormat('png')} className={`flex-1 py-1.5 text-xs rounded border ${exportFormat === 'png' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>PNG</button>
                                        <button onClick={() => setExportFormat('jpeg')} className={`flex-1 py-1.5 text-xs rounded border ${exportFormat === 'jpeg' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>JPEG</button>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Quality / Size</label>
                                <select 
                                    value={exportQuality}
                                    onChange={(e) => setExportQuality(Number(e.target.value))}
                                    className="w-full text-xs p-2 border border-slate-200 rounded bg-white outline-none focus:border-blue-500"
                                >
                                    <option value={1}>1x (Standard)</option>
                                    <option value={2}>2x (High Res)</option>
                                    <option value={4}>4x (Ultra Print)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* PREVIEW */}
            <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 overflow-auto">
                <div className="relative">
                    {isDownloading && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-800/90 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur z-50">
                            {downloadProgress || 'Processing...'}
                        </div>
                    )}
                    <div className="shadow-2xl rounded-sm overflow-hidden border border-slate-200 ring-4 ring-white">
                        <CoverPreview ref={previewRef} config={config} />
                    </div>
                </div>
            </div>

        </div>
      </div>
  );
}

export default App;