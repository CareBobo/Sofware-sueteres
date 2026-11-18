import { create } from 'zustand';
import { DesignElement, GarmentType, GarmentSize, ViewSide, ProjectData, OrderItem } from '../types';
import { GARMENT_CONFIGS } from '../constants/garments';

interface EditorState {
  // Garment attributes
  garmentType: GarmentType;
  size: GarmentSize;
  shirtColor: string;
  activeSide: 'front' | 'back';
  customModelUrl: string | null;
  
  // Design Elements
  elements: DesignElement[];
  selectedElementId: string | null;

  // History for Undo / Redo
  history: DesignElement[][];
  historyIndex: number;

  // 3D Camera Controls State
  cameraPreset: ViewSide | 'reset' | null;
  cameraPresetNonce: number; // Increment to trigger animation

  // UI Modals & Toasts
  activeModal: 'projects' | 'orders' | 'export' | 'share' | null;
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;
  isCapturing: boolean;

  // Current Project
  currentProjectId: string | null;
  projectName: string;

  // Material Settings (From Image 3)
  fabricRoughness: number;
  fabricMetalness: number;
  fabricReflectivity: number;
  fabricOpacity: number;
  setFabricProperty: (prop: 'fabricRoughness' | 'fabricMetalness' | 'fabricReflectivity' | 'fabricOpacity', val: number) => void;
  resetFabricProperties: () => void;

  // Object & Zone Colors (From Image 2)
  frontDesignColor: string;
  backDesignColor: string;
  sleeveSeamsColor: string;
  leftSleeveColor: string;
  rightSleeveColor: string;
  collarSeamsColor: string;
  setZoneColor: (zone: 'front' | 'back' | 'sleeveSeams' | 'leftSleeve' | 'rightSleeve' | 'collarSeams', color: string) => void;

  // Object Visibility (From Image 2)
  showSleeveSeams: boolean;
  showCollarSeams: boolean;
  showLeftSleeve: boolean;
  showRightSleeve: boolean;
  toggleZoneVisibility: (zone: 'sleeveSeams' | 'collarSeams' | 'leftSleeve' | 'rightSleeve') => void;

  // Actions
  setGarmentType: (type: GarmentType) => void;
  setSize: (size: GarmentSize) => void;
  setShirtColor: (hex: string) => void;
  setActiveSide: (side: 'front' | 'back') => void;
  setCameraPreset: (preset: ViewSide | 'reset') => void;
  setCustomModelUrl: (url: string | null) => void;
  
  // Element Actions
  setSelectedElementId: (id: string | null) => void;
  addElement: (element: Omit<DesignElement, 'id' | 'zIndex'>) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  clearSideElements: (side: 'front' | 'back') => void;
  clearAllElements: () => void;
  duplicateElement: (id: string) => void;
  reorderElement: (id: string, direction: 'up' | 'down' | 'front' | 'back') => void;
  toggleElementVisibility: (id: string) => void;
  toggleElementLock: (id: string) => void;
  resetElementTransform: (id: string) => void;
  applyPresetPlacement: (id: string, x: number, y: number, widthCm: number, heightCm: number, side: 'front' | 'back') => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Project Actions
  setProjectName: (name: string) => void;
  loadProject: (project: ProjectData) => void;
  resetProject: () => void;
  setActiveModal: (modal: 'projects' | 'orders' | 'export' | 'share' | null) => void;
  setToast: (toast: { text: string; type: 'success' | 'info' | 'error' } | null) => void;
  setIsCapturing: (val: boolean) => void;
}

const MAX_HISTORY = 30;

export const useEditorStore = create<EditorState>((set, get) => ({
  garmentType: 'adult',
  size: 'M',
  shirtColor: '#FFFFFF',
  activeSide: 'front',
  customModelUrl: null,
  elements: [],
  selectedElementId: null,
  history: [[]],
  historyIndex: 0,
  cameraPreset: 'front',
  cameraPresetNonce: 0,
  activeModal: null,
  toastMessage: null,
  isCapturing: false,
  currentProjectId: null,
  projectName: 'Mi Diseño SHADANA 1',

  // Material settings initial values
  fabricRoughness: 1.0,
  fabricMetalness: 0.0,
  fabricReflectivity: 0.84,
  fabricOpacity: 1.0,
  setFabricProperty: (prop, val) => set({ [prop]: val } as any),
  resetFabricProperties: () => set({
    fabricRoughness: 1.0,
    fabricMetalness: 0.0,
    fabricReflectivity: 0.84,
    fabricOpacity: 1.0,
  }),

  // Object & Zone Colors initial values
  frontDesignColor: '#FFFFFF',
  backDesignColor: '#FFFFFF',
  sleeveSeamsColor: '#FFFFFF',
  leftSleeveColor: '#FFFFFF',
  rightSleeveColor: '#FFFFFF',
  collarSeamsColor: '#FFFFFF',
  setZoneColor: (zone, color) => {
    const keyMap = {
      front: 'frontDesignColor',
      back: 'backDesignColor',
      sleeveSeams: 'sleeveSeamsColor',
      leftSleeve: 'leftSleeveColor',
      rightSleeve: 'rightSleeveColor',
      collarSeams: 'collarSeamsColor',
    } as const;
    set({ [keyMap[zone]]: color } as any);
  },

  // Object Visibility
  showSleeveSeams: true,
  showCollarSeams: true,
  showLeftSleeve: true,
  showRightSleeve: true,
  toggleZoneVisibility: (zone) => {
    const keyMap = {
      sleeveSeams: 'showSleeveSeams',
      collarSeams: 'showCollarSeams',
      leftSleeve: 'showLeftSleeve',
      rightSleeve: 'showRightSleeve',
    } as const;
    const key = keyMap[zone];
    set((state) => ({ [key]: !state[key] } as any));
  },

  setCustomModelUrl: (url) => set({ customModelUrl: url }),

  setGarmentType: (type) => {
    const config = GARMENT_CONFIGS[type];
    set({
      garmentType: type,
      size: config.defaultSize,
    });
  },

  setSize: (size) => set({ size }),
  setShirtColor: (hex) =>
    set((state) => ({
      shirtColor: hex,
      frontDesignColor: state.frontDesignColor === state.shirtColor ? hex : state.frontDesignColor,
      backDesignColor: state.backDesignColor === state.shirtColor ? hex : state.backDesignColor,
      sleeveSeamsColor: state.sleeveSeamsColor === state.shirtColor ? hex : state.sleeveSeamsColor,
      leftSleeveColor: state.leftSleeveColor === state.shirtColor ? hex : state.leftSleeveColor,
      rightSleeveColor: state.rightSleeveColor === state.shirtColor ? hex : state.rightSleeveColor,
      collarSeamsColor: state.collarSeamsColor === state.shirtColor ? hex : state.collarSeamsColor,
    })),
  setActiveSide: (side) => {
    set({ 
      activeSide: side,
      cameraPreset: side,
      cameraPresetNonce: get().cameraPresetNonce + 1
    });
  },

  setCameraPreset: (preset) => {
    set((state) => ({
      cameraPreset: preset,
      cameraPresetNonce: state.cameraPresetNonce + 1,
      // If user clicks front or back, also sync active editing side
      activeSide: (preset === 'front' || preset === 'back') ? preset : state.activeSide,
    }));
  },

  setSelectedElementId: (id) => set({ selectedElementId: id }),

  addElement: (elementData) => {
    const state = get();
    const id = 'elem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newZIndex = state.elements.length > 0 ? Math.max(...state.elements.map(e => e.zIndex)) + 1 : 1;

    const newElement: DesignElement = {
      ...elementData,
      id,
      zIndex: newZIndex,
    };

    const newElements = [...state.elements, newElement];
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newElements);
    if (newHistory.length > MAX_HISTORY) newHistory.shift();

    set({
      elements: newElements,
      selectedElementId: id,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  updateElement: (id, updates) => {
    const state = get();
    const newElements = state.elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );

    set({ elements: newElements });

    // Debounced or direct state update
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newElements);
    if (newHistory.length > MAX_HISTORY) newHistory.shift();

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  removeElement: (id) => {
    const state = get();
    const newElements = state.elements.filter((el) => el.id !== id);
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newElements);

    set({
      elements: newElements,
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  clearSideElements: (side) => {
    const state = get();
    const newElements = state.elements.filter((el) => el.side !== side);
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newElements);

    set({
      elements: newElements,
      selectedElementId: null,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  clearAllElements: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push([]);

    set({
      elements: [],
      selectedElementId: null,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  duplicateElement: (id) => {
    const state = get();
    const source = state.elements.find((el) => el.id === id);
    if (!source) return;

    const newId = 'elem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const duplicate: DesignElement = {
      ...source,
      id: newId,
      name: `${source.name} (Copia)`,
      x: Math.min(0.85, source.x + 0.04),
      y: Math.min(0.85, source.y + 0.04),
      zIndex: Math.max(...state.elements.map(e => e.zIndex)) + 1,
    };

    const newElements = [...state.elements, duplicate];
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newElements);

    set({
      elements: newElements,
      selectedElementId: newId,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  reorderElement: (id, direction) => {
    const state = get();
    const currentList = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
    const index = currentList.findIndex((el) => el.id === id);
    if (index === -1) return;

    if (direction === 'up' && index < currentList.length - 1) {
      const temp = currentList[index].zIndex;
      currentList[index].zIndex = currentList[index + 1].zIndex;
      currentList[index + 1].zIndex = temp;
    } else if (direction === 'down' && index > 0) {
      const temp = currentList[index].zIndex;
      currentList[index].zIndex = currentList[index - 1].zIndex;
      currentList[index - 1].zIndex = temp;
    } else if (direction === 'front') {
      const maxZ = Math.max(...currentList.map(e => e.zIndex));
      currentList[index].zIndex = maxZ + 1;
    } else if (direction === 'back') {
      const minZ = Math.min(...currentList.map(e => e.zIndex));
      currentList[index].zIndex = Math.max(0, minZ - 1);
    }

    set({ elements: [...currentList] });
  },

  toggleElementVisibility: (id) => {
    const state = get();
    set({
      elements: state.elements.map(el => el.id === id ? { ...el, visible: !el.visible } : el)
    });
  },

  toggleElementLock: (id) => {
    const state = get();
    set({
      elements: state.elements.map(el => el.id === id ? { ...el, locked: !el.locked } : el)
    });
  },

  resetElementTransform: (id) => {
    const state = get();
    const target = state.elements.find(el => el.id === id);
    if (!target) return;

    state.updateElement(id, {
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
      widthCm: 20,
      heightCm: 20,
    });
  },

  applyPresetPlacement: (id, x, y, widthCm, heightCm, side) => {
    const state = get();
    state.updateElement(id, {
      x,
      y,
      widthCm,
      heightCm,
      side,
      rotation: 0,
      scale: 1,
    });
    set({ activeSide: side, cameraPreset: side });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({
        elements: state.history[newIndex],
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      set({
        elements: state.history[newIndex],
        historyIndex: newIndex,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  setProjectName: (name) => set({ projectName: name }),

  loadProject: (project) => {
    set({
      currentProjectId: project.id,
      projectName: project.name,
      garmentType: project.garmentType,
      size: project.size,
      shirtColor: project.color,
      elements: project.elements,
      selectedElementId: null,
      history: [project.elements],
      historyIndex: 0,
    });
  },

  resetProject: () => {
    set({
      currentProjectId: null,
      projectName: 'Nuevo Diseño SHADANA',
      elements: [],
      selectedElementId: null,
      history: [[]],
      historyIndex: 0,
      shirtColor: '#FFFFFF',
      activeSide: 'front',
      cameraPreset: 'front',
    });
  },

  setActiveModal: (modal) => set({ activeModal: modal }),
  setToast: (toast) => set({ toastMessage: toast }),
  setIsCapturing: (val) => set({ isCapturing: val }),
}));
