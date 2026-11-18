import React, { useState, useRef, useEffect } from 'react';
import { 
  Shirt, 
  Palette, 
  Upload, 
  Type, 
  Layers, 
  Compass, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ArrowUp, 
  ArrowDown, 
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { GARMENT_CONFIGS, COLOR_PRESETS, PLACEMENT_PRESETS, AVAILABLE_FONTS } from '../../constants/garments';
import { GarmentType, GarmentSize } from '../../types';
import { storageService } from '../../services/storage';

type TabType = 'garment' | 'colors' | 'upload' | 'text' | 'presets' | 'layers';

export const LeftSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('garment');

  const {
    garmentType,
    setGarmentType,
    size,
    setSize,
    shirtColor,
    setShirtColor,
    activeSide,
    addElement,
    elements,
    selectedElementId,
    setSelectedElementId,
    toggleElementVisibility,
    toggleElementLock,
    removeElement,
    reorderElement,
    applyPresetPlacement,
    setToast,
    customModelUrl,
    setCustomModelUrl,
    clearSideElements,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const [recentAssets, setRecentAssets] = useState<{ id: string; dataUrl: string; name: string }[]>([]);

  // Text state
  const [inputText, setInputText] = useState('SHADANA');
  const [inputFont, setInputFont] = useState('Impact, sans-serif');
  const [inputColor, setInputColor] = useState('#FFFFFF');
  const [inputSize, setInputSize] = useState(38);

  const currentGarment = GARMENT_CONFIGS[garmentType];

  // Load cached assets on mount
  useEffect(() => {
    storageService.getAssets().then(setRecentAssets).catch(() => {});
  }, []);

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setToast({ text: 'Formato no compatible. Por favor sube PNG, JPG o WebP.', type: 'error' });
      return;
    }

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setToast({ text: 'El archivo excede el límite máximo de 20MB.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Calculate aspect ratio
        const aspect = img.height / img.width;
        const initialWidthCm = 20;
        const initialHeightCm = Math.round(initialWidthCm * aspect);

        // Add element to store
        addElement({
          type: 'image',
          side: activeSide,
          name: file.name.substring(0, 24),
          url: dataUrl,
          originalWidth: img.width,
          originalHeight: img.height,
          x: 0.5,
          y: 0.5,
          scale: 1,
          rotation: 0,
          widthCm: initialWidthCm,
          heightCm: initialHeightCm,
          keepAspect: false,
          visible: true,
          locked: false,
          opacity: 1,
        });

        // Save to asset library for reuse
        const assetId = 'asset_' + Date.now();
        storageService.saveAsset(assetId, dataUrl, file.name).then(() => {
          setRecentAssets(prev => [{ id: assetId, dataUrl, name: file.name }, ...prev.slice(0, 7)]);
        }).catch(() => {});

        setToast({ 
          text: `Imagen cargada con éxito en el ${activeSide === 'front' ? 'Frente' : 'Espalda'}.`, 
          type: 'success' 
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle custom 3D model upload (.glb / .gltf)
  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
      setToast({ text: 'Por favor selecciona un archivo 3D en formato .GLB o .GLTF', type: 'error' });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCustomModelUrl(objectUrl);
    setToast({ text: `Modelo 3D "${file.name}" cargado en el visor con éxito.`, type: 'success' });

    if (modelInputRef.current) modelInputRef.current.value = '';
  };

  // Add text element
  const handleAddText = () => {
    if (!inputText.trim()) return;

    addElement({
      type: 'text',
      side: activeSide,
      name: `Texto: "${inputText.substring(0, 15)}"`,
      text: inputText,
      fontFamily: inputFont,
      fontSize: inputSize,
      textColor: inputColor,
      fontWeight: 'bold',
      x: 0.5,
      y: 0.45,
      scale: 1,
      rotation: 0,
      widthCm: 22,
      heightCm: 10,
      keepAspect: false,
      visible: true,
      locked: false,
      opacity: 1,
    });

    setToast({ text: 'Texto agregado correctamente al diseño.', type: 'success' });
  };

  const tabs = [
    { id: 'garment', label: 'Prenda', icon: Shirt },
    { id: 'colors', label: 'Color', icon: Palette },
    { id: 'upload', label: 'Subir PNG', icon: Upload },
    { id: 'text', label: 'Texto', icon: Type },
    { id: 'presets', label: 'Ubicación', icon: Compass },
    { id: 'layers', label: `Capas (${elements.filter(e => e.side === activeSide).length})`, icon: Layers },
  ];

  return (
    <aside className="w-80 border-r border-slate-800 bg-slate-950/95 flex flex-col h-full z-20 shrink-0">
      {/* Tabs Bar */}
      <div className="grid grid-cols-6 border-b border-slate-800 bg-slate-900/60 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              title={tab.label}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] truncate max-w-full">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 1. GARMENT TAB */}
        {activeTab === 'garment' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Modelo de Prenda
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(GARMENT_CONFIGS).map((item) => {
                  const isSelected = garmentType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setGarmentType(item.id as GarmentType)}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-white shadow-sm shadow-amber-500/10'
                          : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs">{item.name}</span>
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{item.description}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom 3D Model (.glb / .gltf) Uploader */}
              <div className="mt-3 pt-3 border-t border-slate-800">
                <input
                  ref={modelInputRef}
                  type="file"
                  accept=".glb,.gltf"
                  onChange={handleModelUpload}
                  className="hidden"
                />
                
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span>📦</span>
                      <span>Tu Modelo 3D Personalizado</span>
                    </span>
                    {customModelUrl && (
                      <button
                        onClick={() => {
                          setCustomModelUrl(null);
                          setToast({ text: 'Volviendo al modelo 3D estándar.', type: 'info' });
                        }}
                        className="text-[10px] text-slate-400 hover:text-red-400 underline"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    ¿Tienes tu propio archivo <strong>.GLB</strong> de camiseta? Cárgalo directamente para visualizarlo aquí.
                  </p>

                  <button
                    onClick={() => modelInputRef.current?.click()}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-95"
                  >
                    <span>Cargar Modelo Propio (.GLB / .GLTF)</span>
                  </button>
                  
                  <p className="text-[10px] text-slate-500 text-center font-mono">
                    O coloca tu archivo en: public/models/camiseta.glb
                  </p>
                </div>
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Talla ({currentGarment.name.includes('Infantil') ? 'Niño' : 'Adulto'})
                </h3>
                <span className="text-[10px] text-slate-500">Visual 3D</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentGarment.availableSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-10 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                      size === s
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Sublimation Print Area Notice */}
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Área máx. Frente:</span>
                <span className="text-slate-200 font-semibold">{currentGarment.printAreaWidthCm.front} × {currentGarment.printAreaHeightCm.front} cm</span>
              </div>
              <div className="flex justify-between">
                <span>Área máx. Espalda:</span>
                <span className="text-slate-200 font-semibold">{currentGarment.printAreaWidthCm.back} × {currentGarment.printAreaHeightCm.back} cm</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. COLORS TAB */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Color de Tela Base
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Los estampados PNG conservan su transparencia y colores exactos sin alterarse.
              </p>
              
              <div className="grid grid-cols-5 gap-2.5">
                {COLOR_PRESETS.map((color) => {
                  const isSelected = shirtColor.toLowerCase() === color.hex.toLowerCase();
                  return (
                    <button
                      key={color.name}
                      onClick={() => setShirtColor(color.hex)}
                      title={color.name}
                      className={`h-11 rounded-xl flex items-center justify-center transition-all relative border ${
                        isSelected 
                          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-105 border-white' 
                          : 'border-slate-700/60 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && (
                        <div 
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: color.textColor }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Color Personalizado (Hex / Pantone)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={shirtColor}
                  onChange={(e) => setShirtColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                <input
                  type="text"
                  value={shirtColor.toUpperCase()}
                  onChange={(e) => setShirtColor(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Subir Diseño para Estampar
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Sube tu logo o ilustración. Se agregará al lado visible (<strong className="text-amber-400">{activeSide === 'front' ? 'Frente' : 'Espalda'}</strong>).
              </p>

              {/* Upload Dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-200">
                  Seleccionar Imagen
                </span>
                <span className="text-[10px] text-slate-400">
                  PNG transparente, JPG o WebP (hasta 20MB)
                </span>
              </button>
            </div>

            {/* PNG Transparency reassurance banner */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-200 leading-relaxed">
                <strong>Canal Alfa 100% Nativo:</strong> Los archivos PNG sin fondo se mostrarán limpios sobre la tela, sin recuadros blancos.
              </div>
            </div>

            {/* Recent Assets in Session */}
            {recentAssets.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Biblioteca Reciente
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {recentAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        addElement({
                          type: 'image',
                          side: activeSide,
                          name: asset.name.substring(0, 20),
                          url: asset.dataUrl,
                          x: 0.5,
                          y: 0.5,
                          scale: 1,
                          rotation: 0,
                          widthCm: 22,
                          heightCm: 22,
                          keepAspect: false,
                          visible: true,
                          locked: false,
                          opacity: 1,
                        });
                        setToast({ text: 'Diseño reutilizado con éxito.', type: 'info' });
                      }}
                      title={`Reutilizar ${asset.name}`}
                      className="aspect-square rounded-lg border border-slate-800 bg-slate-900/60 p-1.5 hover:border-amber-400 transition-all flex items-center justify-center group"
                    >
                      <img
                        src={asset.dataUrl}
                        alt={asset.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. TEXT TAB */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Agregar Texto Personalizado
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Nombres, dorsales numéricos, slogans o frases para sublimar.
              </p>

              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-300">Contenido del texto:</label>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe aquí..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Font selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Tipografía:</label>
              <select
                value={inputFont}
                onChange={(e) => setInputFont(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font.name} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Text Color */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Color del texto:</label>
              <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
                <input
                  type="color"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                <span className="text-xs font-mono text-slate-300">{inputColor.toUpperCase()}</span>
              </div>
            </div>

            {/* Add button */}
            <button
              onClick={handleAddText}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Insertar Texto en {activeSide === 'front' ? 'Frente' : 'Espalda'}</span>
            </button>
          </div>
        )}

        {/* 5. PRESETS TAB */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Ubicaciones Estándar de Sublimación
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Aplica medidas y posiciones recomendadas al elemento seleccionado.
              </p>

              {!selectedElementId && (
                <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 mb-3 text-[11px] text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Primero selecciona un elemento de la lista o canvas para ubicarlo.</span>
                </div>
              )}

              <div className="space-y-2">
                {PLACEMENT_PRESETS.map((preset) => {
                  return (
                    <button
                      key={preset.id}
                      disabled={!selectedElementId}
                      onClick={() => {
                        if (selectedElementId) {
                          applyPresetPlacement(
                            selectedElementId,
                            preset.x,
                            preset.y,
                            preset.widthCm,
                            preset.heightCm,
                            preset.side
                          );
                          setToast({ text: `Ubicación aplicada: ${preset.name}`, type: 'success' });
                        }
                      }}
                      className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-amber-500/50 disabled:opacity-40 disabled:hover:border-slate-800 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-200 group-hover:text-amber-400">
                          {preset.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {preset.widthCm}×{preset.heightCm} cm
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{preset.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 6. LAYERS TAB */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Capas en {activeSide === 'front' ? 'Frente' : 'Espalda'}
              </h3>
              <span className="text-[10px] text-slate-500">
                {elements.filter(e => e.side === activeSide).length} elementos
              </span>
            </div>

            {elements.filter(e => e.side === activeSide).length > 0 && (
              <button
                onClick={() => {
                  clearSideElements(activeSide);
                  setToast({ text: `Prenda limpia: se eliminaron todos los diseños del ${activeSide === 'front' ? 'Frente' : 'Espalda'}.`, type: 'info' });
                }}
                className="w-full bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar todo el {activeSide === 'front' ? 'Frente' : 'Espalda'}</span>
              </button>
            )}

            {elements.filter(e => e.side === activeSide).length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No hay elementos en este lado. Sube una imagen o inserta un texto.
              </div>
            ) : (
              <div className="space-y-1.5">
                {[...elements]
                  .filter(e => e.side === activeSide)
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((el) => {
                    const isSelected = selectedElementId === el.id;
                    return (
                      <div
                        key={el.id}
                        onClick={() => setSelectedElementId(el.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] font-mono text-slate-500">
                            {el.type === 'image' ? '🖼️' : '🔤'}
                          </span>
                          <span className="text-xs font-medium truncate">{el.name}</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {/* Visibility */}
                          <button
                            onClick={() => toggleElementVisibility(el.id)}
                            className="p-1 hover:text-white text-slate-400 transition-colors"
                            title={el.visible ? 'Ocultar' : 'Mostrar'}
                          >
                            {el.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                          </button>

                          {/* Lock */}
                          <button
                            onClick={() => toggleElementLock(el.id)}
                            className="p-1 hover:text-white text-slate-400 transition-colors"
                            title={el.locked ? 'Desbloquear' : 'Bloquear'}
                          >
                            {el.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Reorder Up */}
                          <button
                            onClick={() => reorderElement(el.id, 'up')}
                            className="p-1 hover:text-white text-slate-400 transition-colors"
                            title="Subir nivel"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Reorder Down */}
                          <button
                            onClick={() => reorderElement(el.id, 'down')}
                            className="p-1 hover:text-white text-slate-400 transition-colors"
                            title="Bajar nivel"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => removeElement(el.id)}
                            className="p-1 hover:text-red-400 text-slate-400 transition-colors"
                            title="Eliminar capa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
