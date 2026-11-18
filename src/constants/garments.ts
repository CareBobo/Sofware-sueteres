import { GarmentConfig, ColorPreset } from '../types';

export const GARMENT_CONFIGS: Record<string, GarmentConfig> = {
  adult: {
    id: 'adult',
    name: 'Camiseta Adulto (Clásica)',
    description: 'Corte clásico unisex, algodón/poliéster para sublimación tacto suave.',
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    defaultSize: 'M',
    printAreaWidthCm: { front: 32, back: 35 },
    printAreaHeightCm: { front: 42, back: 45 },
    badge: 'Más Vendida',
  },
  kids: {
    id: 'kids',
    name: 'Camiseta Infantil',
    description: 'Proporción especial para niños y jóvenes con máxima resistencia.',
    availableSizes: ['4', '6', '8', '10', '12', '14', '16'],
    defaultSize: '8',
    printAreaWidthCm: { front: 22, back: 24 },
    printAreaHeightCm: { front: 30, back: 32 },
    badge: 'Infantil',
  },
  oversized: {
    id: 'oversized',
    name: 'Camiseta Oversized (Streetwear)',
    description: 'Hombro caído, torso holgado y mangas anchas estilo moderno.',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    defaultSize: 'L',
    printAreaWidthCm: { front: 36, back: 38 },
    printAreaHeightCm: { front: 48, back: 50 },
    badge: 'Tendencia',
  },
  long_sleeve: {
    id: 'long_sleeve',
    name: 'Camiseta Manga Larga',
    description: 'Mangas completas con ribetes elásticos, ideal para climas fríos.',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    defaultSize: 'M',
    printAreaWidthCm: { front: 32, back: 35 },
    printAreaHeightCm: { front: 42, back: 45 },
    badge: 'Manga Larga',
  },
  polo: {
    id: 'polo',
    name: 'Camiseta Tipo Polo',
    description: 'Cuello camisero y tapeta frontal con botones para uniformes y estilo formal.',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    defaultSize: 'M',
    printAreaWidthCm: { front: 28, back: 32 },
    printAreaHeightCm: { front: 38, back: 42 },
    badge: 'Elegante',
  },
};

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Blanco Puro', hex: '#FFFFFF', textColor: '#0f172a' },
  { name: 'Negro Azabache', hex: '#121212', textColor: '#ffffff' },
  { name: 'Gris Melange', hex: '#64748b', textColor: '#ffffff' },
  { name: 'Gris Claro', hex: '#cbd5e1', textColor: '#0f172a' },
  { name: 'Rojo Carmesí', hex: '#dc2626', textColor: '#ffffff' },
  { name: 'Azul Rey', hex: '#2563eb', textColor: '#ffffff' },
  { name: 'Azul Marino', hex: '#0f172a', textColor: '#ffffff' },
  { name: 'Amarillo Canario', hex: '#facc15', textColor: '#0f172a' },
  { name: 'Verde Esmeralda', hex: '#16a34a', textColor: '#ffffff' },
  { name: 'Verde Militar', hex: '#3f4f38', textColor: '#ffffff' },
  { name: 'Rosado Pastel', hex: '#f472b6', textColor: '#0f172a' },
  { name: 'Naranja Fuego', hex: '#ea580c', textColor: '#ffffff' },
  { name: 'Púrpura Neón', hex: '#7c3aed', textColor: '#ffffff' },
  { name: 'Vino Tinto', hex: '#581c87', textColor: '#ffffff' },
  { name: 'Beige / Arena', hex: '#d6c7b2', textColor: '#0f172a' },
];

export interface PlacementPreset {
  id: string;
  name: string;
  side: 'front' | 'back';
  x: number;
  y: number;
  widthCm: number;
  heightCm: number;
  icon?: string;
  description: string;
}

export const PLACEMENT_PRESETS: PlacementPreset[] = [
  {
    id: 'left_chest',
    name: 'Pecho Izquierdo (Logo)',
    side: 'front',
    x: 0.35,
    y: 0.28,
    widthCm: 10,
    heightCm: 10,
    description: 'Ideal para escudos, insignias y logos corporativos (10x10cm)',
  },
  {
    id: 'center_chest',
    name: 'Centro Pecho',
    side: 'front',
    x: 0.50,
    y: 0.32,
    widthCm: 22,
    heightCm: 18,
    description: 'Excelente para frases y logos horizontales (22x18cm)',
  },
  {
    id: 'large_front',
    name: 'Frente Grande (A3)',
    side: 'front',
    x: 0.50,
    y: 0.48,
    widthCm: 30,
    heightCm: 40,
    description: 'Estampado de impacto tamaño grande para sublimación (30x40cm)',
  },
  {
    id: 'upper_back',
    name: 'Espalda Superior',
    side: 'back',
    x: 0.50,
    y: 0.24,
    widthCm: 28,
    heightCm: 12,
    description: 'Zona de nombre o logo dorsal debajo del cuello (28x12cm)',
  },
  {
    id: 'large_back',
    name: 'Espalda Completa',
    side: 'back',
    x: 0.50,
    y: 0.50,
    widthCm: 32,
    heightCm: 44,
    description: 'Diseño principal posterior tamaño completo (32x44cm)',
  },
];

export const AVAILABLE_FONTS = [
  { name: 'Impact Moderno', value: 'Impact, sans-serif' },
  { name: 'Bebas Neue', value: "'Bebas Neue', sans-serif" },
  { name: 'Montserrat Bold', value: "'Montserrat', sans-serif" },
  { name: 'Oswald', value: "'Oswald', sans-serif" },
  { name: 'Pacifico Caligráfica', value: "'Pacifico', cursive" },
  { name: 'Permanent Marker', value: "'Permanent Marker', cursive" },
  { name: 'Roboto Black', value: "'Roboto', sans-serif" },
  { name: 'Orbitron Futurista', value: "'Orbitron', sans-serif" },
  { name: 'Cinzel Elegante', value: "'Cinzel', serif" },
  { name: 'Arial Estándar', value: 'Arial, sans-serif' },
];
