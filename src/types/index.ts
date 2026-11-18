export type GarmentType = 'adult' | 'kids' | 'oversized' | 'long_sleeve' | 'polo';

export type GarmentSize = 
  | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' // Adult
  | '4' | '6' | '8' | '10' | '12' | '14' | '16'; // Kids

export type ViewSide = 'front' | 'back' | 'left' | 'right';

export interface DesignElement {
  id: string;
  type: 'image' | 'text';
  side: 'front' | 'back';
  name: string;
  // Image properties
  url?: string;
  originalWidth?: number;
  originalHeight?: number;
  // Text properties
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold' | '900';
  fontStyle?: 'normal' | 'italic';
  textCurve?: number;
  // Spatial placement (normalized 0 to 1 on the printable canvas)
  x: number; // 0.5 is center
  y: number; // 0.5 is center
  scale: number; // 1 is default
  scaleX?: number;
  scaleY?: number;
  rotation: number; // in degrees
  // Sublimation physical dimensions (in centimeters)
  widthCm: number;
  heightCm: number;
  keepAspect: boolean;
  // Layers & states
  visible: boolean;
  locked: boolean;
  zIndex: number;
  opacity: number;
}

export interface GarmentConfig {
  id: GarmentType;
  name: string;
  description: string;
  availableSizes: GarmentSize[];
  defaultSize: GarmentSize;
  printAreaWidthCm: { front: number; back: number };
  printAreaHeightCm: { front: number; back: number };
  badge?: string;
}

export interface ColorPreset {
  name: string;
  hex: string;
  textColor: string;
}

export type OrderStatus = 
  | 'design' 
  | 'pending_approval' 
  | 'approved' 
  | 'in_production' 
  | 'completed' 
  | 'delivered';

export interface OrderItem {
  id: string;
  projectId?: string;
  projectName?: string;
  customerName: string;
  customerPhone?: string;
  garmentType: GarmentType;
  size: GarmentSize;
  color: string;
  quantity: number;
  unitPrice: number;
  deposit: number;
  status: OrderStatus;
  notes: string;
  createdAt: number;
  updatedAt: number;
  previewImage?: string;
}

export interface ProjectData {
  id: string;
  name: string;
  garmentType: GarmentType;
  size: GarmentSize;
  color: string;
  elements: DesignElement[];
  createdAt: number;
  updatedAt: number;
  previewImage?: string;
}
