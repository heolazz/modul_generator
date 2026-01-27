// MassPushModul/types.ts

export type CategoryShape = 'rounded' | 'pill' | 'tag-left' | 'tag-right' | 'rectangle';

export interface CoverConfig {
  layout: 'classic' | 'split' | 'modern'; 
  title: string;
  category: string;
  level: string; 
  speakerName: string;
  
  // Colors
  primaryColor: string; 
  accentColor: string; 
  categoryBgColor: string;
  categoryTextColor: string;
  titleColor: string;
  levelColor: string; 
  speakerColor: string; 

  // Assets
  logoUrl: string | null;
  bottomImageUrl: string | null; 
  sideImageUrl: string | null; 
  
  // Customization
  fontFamily: string;
  logoWidth: number;
  logoPositionX: number; 
  logoPositionY: number; 
  
  // --- CATEGORY SETTINGS ---
  categoryShape: CategoryShape;
  categoryRounded: number;
  categoryFontSize: number;      
  categoryLetterSpacing: number; 
  categoryFontWeight: string; 
  categoryPositionY: number;     // <--- BARU: Posisi Y Kategori
  
  // --- TITLE SETTINGS ---
  titleFontSize: number;
  titleFontWeight: string;
  titleLetterSpacing: number;
  titleLineHeight: number;
  
  // --- LEVEL SETTINGS ---
  levelFontSize: number; 
  levelLetterSpacing: number; 
  levelFontWeight: string; 

  contentPositionY: number; 

  // --- DECORATION & LAYOUT ---
  separatorLineCount: number;    
  separatorLineHeight: number;   
  separatorLineSpacing: number;
  separatorPositionY: number;   
  
  sideRectWidth: number;          
  sideImageOffsetX: number;       

  // Watermark Settings
  showWatermark: boolean;
  watermarkWidth: number;
  watermarkPositionX: number;
  watermarkPositionY: number;
  watermarkOpacity: number;
}

export const PRIMARY_BG_COLORS = ['#307FE2', '#71C5E8', '#097BF3', '#0857C3'];

export const DEFAULT_CONFIG: CoverConfig = {
  layout: 'modern', 
  title: "Strategi Transformasi Digital untuk UMKM Masa Kini",
  category: "KATEGORI",
  level: "LEVEL: INTERMEDIATE",
  speakerName: "Dr. Budi Santoso, M.B.A",
  
  primaryColor: '#307FE2',      
  accentColor: "#FFD700",       
  categoryBgColor: "#FFD700",   
  categoryTextColor: "#0F3D6E", 
  titleColor: "#ffffff",        
  levelColor: "#e0f2fe",        
  speakerColor: "#ffffff",      
  
  logoUrl: "/images/logo.png", 
  bottomImageUrl: "/images/material-symbols_book-outline-1.png",
  sideImageUrl: null,
  
  fontFamily: 'Inter',
  
  logoWidth: 120, 
  logoPositionX: 0,
  logoPositionY: 0,
  
  categoryShape: 'pill', 
  categoryRounded: 99,           
  categoryFontSize: 11,         
  categoryLetterSpacing: 0.2,  
  categoryFontWeight: '700', 
  categoryPositionY: 0,          // <--- DEFAULT 0
  
  titleFontSize: 32,           
  titleFontWeight: '800',      
  titleLineHeight: 1.1,       
  titleLetterSpacing: -0.02,
  
  levelFontSize: 12,           
  levelLetterSpacing: 0.1,    
  levelFontWeight: '500', 
  
  contentPositionY: 32, 

  separatorLineCount: 1,         
  separatorLineHeight: 4,        
  separatorLineSpacing: 6,
  separatorPositionY: 0,         
  
  sideRectWidth: 310,            
  sideImageOffsetX: 0,           

  showWatermark: true,
  watermarkWidth: 400,
  watermarkPositionX: -50, 
  watermarkPositionY: 50,
  watermarkOpacity: 0.1,    
};

// ... (Sisa file: FONT_OPTIONS, CATEGORIES_DATA, dll tetap sama)
export const FONT_OPTIONS = [
    { label: 'Inter', value: 'Inter' },
    { label: 'Roboto', value: 'Roboto' },
    { label: 'Open Sans', value: 'Open Sans' },
    { label: 'Montserrat', value: 'Montserrat' },
    { label: 'Poppins', value: 'Poppins' },
  ];
  
export const FONT_WEIGHT_OPTIONS = [
    { label: 'Light (300)', value: '300' },
    { label: 'Regular (400)', value: '400' },
    { label: 'Medium (500)', value: '500' },
    { label: 'SemiBold (600)', value: '600' },
    { label: 'Bold (700)', value: '700' },
    { label: 'ExtraBold (800)', value: '800' },
    { label: 'Black (900)', value: '900' },
];

export const CATEGORIES_DATA = [
    { name: "Pertanian", color: "#c1ff72", group: "1. Sektor Agrobisnis & SDA" },
    { name: "Perikanan", color: "#c1ff72", group: "1. Sektor Agrobisnis & SDA" },
    { name: "Peternakan", color: "#c1ff72", group: "1. Sektor Agrobisnis & SDA" },
    { name: "Perkebunan", color: "#c1ff72", group: "1. Sektor Agrobisnis & SDA" },
    { name: "Tanaman herbal", color: "#c1ff72", group: "1. Sektor Agrobisnis & SDA" },
    { name: "Tanaman Hias", color: "#c1ff72", group: "1. Sektor Agrobisnis & SDA" },
    { name: "Marketing", color: "#facc15", group: "2. Manajemen & Bisnis" },
    { name: "Legalitas", color: "#facc15", group: "2. Manajemen & Bisnis" },
    { name: "Profil Bisnis", color: "#facc15", group: "2. Manajemen & Bisnis" },
    { name: "Manajemen Operasional", color: "#facc15", group: "2. Manajemen & Bisnis" },
    { name: "Layanan Customer", color: "#facc15", group: "2. Manajemen & Bisnis" },
    { name: "Komunikasi", color: "#facc15", group: "2. Manajemen & Bisnis" },
    { name: "Pola Pikir", color: "#facc15", group: "2. Manajemen & Bisnis" },
    { name: "Ekspor", color: "#facc15", group: "2. Manajemen & Bisnis" },
    { name: "Layanan Digital", color: "#e4bed2", group: "3. Digital & Kreatif" },
    { name: "Content Creator", color: "#e4bed2", group: "3. Digital & Kreatif" },
    { name: "Fotografi", color: "#e4bed2", group: "3. Digital & Kreatif" },
    { name: "Ekosistem", color: "#e4bed2", group: "3. Digital & Kreatif" },
    { name: "Ultra Mikro", color: "#ff751f", group: "4. Keuangan & Ekonomi" },
    { name: "Pembiayaan", color: "#ff751f", group: "4. Keuangan & Ekonomi" },
    { name: "Inklusi Keuangan", color: "#ff751f", group: "4. Keuangan & Ekonomi" },
    { name: "Kopdes", color: "#ff751f", group: "4. Keuangan & Ekonomi" },
    { name: "BRIncubator", color: "#fefefe", group: "5. Program & Desa" },
    { name: "Desa BRIlian", color: "#fefefe", group: "5. Program & Desa" },
    { name: "Reguler", color: "#fefefe", group: "5. Program & Desa" },
    { name: "Analisis Potensi Desa", color: "#fefefe", group: "5. Program & Desa" },
    { name: "FnB", color: "#ffde59", group: "6. Industri Lainnya" },
    { name: "Fashion", color: "#ffde59", group: "6. Industri Lainnya" },
    { name: "Pariwisata", color: "#ffde59", group: "6. Industri Lainnya" },
];
  
// types.ts

export function getContrastColor(hexColor: string) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    if (['#c1ff72', '#facc15', '#e4bed2', '#fefefe', '#ffde59'].includes(hexColor.toLowerCase())) {
        return '#0F3D6E'; 
    }
    
    if (['#ff751f'].includes(hexColor.toLowerCase())) {
        return '#ffffff';
    }

    return (yiq >= 128) ? '#1f2937' : '#ffffff'; 
}