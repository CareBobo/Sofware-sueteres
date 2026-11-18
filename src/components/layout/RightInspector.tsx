import React, { useState } from 'react';
import { 
  Sliders, 
  Move, 
  RotateCw, 
  Maximize2, 
  Copy, 
  Trash2, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Ruler, 
  AlignCenter, 
  Sparkles,
  RefreshCw,
  Layers,
  Palette,
  Eye,
  CheckSquare,
  Square
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { GARMENT_CONFIGS } from '../../constants/garments';

type InspectorTab = 'transform' | 'materials' | 'parts';

export const RightInspector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('transform');

  const {
    elements,
    selectedElementId,
    updateElement,
    removeElement,
    duplicateElement,
    resetElementTransform,
    setSelectedElementId,
    garmentType,
    size,
    shirtColor,
    setShirtColor,
    activeSide,
    setActiveSide,
    // Material settings (From Image 3)
    fabricRoughness,
    fabricMetalness,
    fabricReflectivity,
    fabricOpacity,
    setFabricProperty,
    resetFabricProperties,
    // Zone colors (From Image 2)
    frontDesignColor,
    backDesignColor,
    sleeveSeamsColor,
    leftSleeveColor,
    rightSleeveColor,
    collarSeamsColor,
    setZoneColor,
    // Zone visibility (From Image 2)
    showSleeveSeams,
    showCollarSeams,
    showLeftSleeve,
    showRightSleeve,
    toggleZoneVisibility,
  } = useEditorStore();

  const currentGarment = GARMENT_CONFIGS[garmentType];
  const activeElement = elements.find((el) => el.id === selectedElementId);

  return (
    <aside className="w-80 border-l border-slate-800 bg-slate-950/95 flex flex-col h-full z-20 shrink-0 select-none overflow-hidden">
      {/* Tab Header */}
      <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-900/60 p-1 shrink-0">
        <button
          onClick={() => setActiveTab('transform')}
          className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'transform'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{activeElement ? 'Diseño' : 'Ficha'}</span>
        </button>

        <button
          onClick={() => setActiveTab('parts')}
          className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'parts'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Partes</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'materials'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Material</span>
        </button>
      </div>

      {/* Tab 1: Transform / Element Properties */}
      {activeTab === 'transform' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeElement ? (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Prenda activa:</span>
                  <span className="font-semibold text-slate-200">{currentGarment.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Talla seleccionada:</span>
                  <span className="font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {size}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Lado visible:</span>
                  <span className="font-semibold text-slate-200 capitalize">
                    {activeSide === 'front' ? 'Frente' : 'Espalda'}
                  </span>
                </div>
              </div>

              <div className="bg-amber-500/5 rounded-xl p-3.5 border border-amber-500/20 space-y-2 text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Área de Sublimación Torso</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Las dimensiones se limitan automáticamente a la zona del torso para evitar que el estampado se desborde sobre las mangas.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Frente Torso</span>
                    <span className="text-white font-bold">{currentGarment.printAreaWidthCm.front} × {currentGarment.printAreaHeightCm.front} cm</span>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase">Espalda Torso</span>
                    <span className="text-white font-bold">{currentGarment.printAreaWidthCm.back} × {currentGarment.printAreaHeightCm.back} cm</span>
                  </div>
                </div>
              </div>

              <div className="text-center py-6 text-slate-500 text-xs">
                Selecciona una imagen o texto en la camiseta para ajustar su ancho, altura o posición.
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 truncate">
                  {activeElement.name}
                </h3>
                <button
                  onClick={() => setSelectedElementId(null)}
                  className="text-slate-500 hover:text-slate-300 text-xs px-1.5 py-0.5 rounded hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {/* Big Prominent Delete Button */}
              <button
                onClick={() => {
                  removeElement(activeElement.id);
                  setSelectedElementId(null);
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar este estampado (Dejar limpio)</span>
              </button>

              {/* Side switch */}
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Lado:</span>
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => {
                      updateElement(activeElement.id, { side: 'front' });
                      setActiveSide('front');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      activeElement.side === 'front' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Frente
                  </button>
                  <button
                    onClick={() => {
                      updateElement(activeElement.id, { side: 'back' });
                      setActiveSide('back');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      activeElement.side === 'back' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Espalda
                  </button>
                </div>
              </div>

              {/* Dimensions: Width & Height Controls (Strictly Independent Non-Proportional) */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Ruler className="w-3.5 h-3.5 text-amber-400" />
                    <span>Medidas No Proporcionales (cm)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold">
                    Escalado Libre
                  </span>
                </div>

                {/* Width only */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Solo Ancho (Horizontal):</span>
                    <span className="font-mono text-amber-400 font-bold">{activeElement.widthCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={36}
                    step={0.5}
                    value={activeElement.widthCm}
                    onChange={(e) => {
                      const newW = parseFloat(e.target.value);
                      updateElement(activeElement.id, { widthCm: newW });
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Height only */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Solo Altura (Vertical):</span>
                    <span className="font-mono text-amber-400 font-bold">{activeElement.heightCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={50}
                    step={0.5}
                    value={activeElement.heightCm}
                    onChange={(e) => {
                      const newH = parseFloat(e.target.value);
                      updateElement(activeElement.id, { heightCm: newH });
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>


                {/* Quick Fit Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => updateElement(activeElement.id, { widthCm: 34 })}
                    className="bg-slate-950 hover:bg-slate-800 text-[10px] text-slate-300 py-1.5 rounded-lg border border-slate-800 font-medium transition-colors"
                  >
                    Ancho Torso (34cm)
                  </button>
                  <button
                    onClick={() => updateElement(activeElement.id, { heightCm: 44 })}
                    className="bg-slate-950 hover:bg-slate-800 text-[10px] text-slate-300 py-1.5 rounded-lg border border-slate-800 font-medium transition-colors"
                  >
                    Alto Torso (44cm)
                  </button>
                </div>
              </div>

              {/* Position in Torso */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-amber-400" />
                    <span>Posición en Torso</span>
                  </span>
                  <button
                    onClick={() => updateElement(activeElement.id, { x: 0.5, y: 0.5 })}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                  >
                    <AlignCenter className="w-3 h-3" />
                    <span>Centrar</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Horizontal (X):</span>
                    <span className="font-mono">{Math.round(activeElement.x * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.15}
                    max={0.85}
                    step={0.01}
                    value={activeElement.x}
                    onChange={(e) => updateElement(activeElement.id, { x: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Vertical (Y):</span>
                    <span className="font-mono">{Math.round(activeElement.y * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={0.9}
                    step={0.01}
                    value={activeElement.y}
                    onChange={(e) => updateElement(activeElement.id, { y: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Rotation & Opacity */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rotación</span>
                </span>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Ángulo:</span>
                    <span className="font-mono">{Math.round(activeElement.rotation)}°</span>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={activeElement.rotation}
                    onChange={(e) => updateElement(activeElement.id, { rotation: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between gap-1 pt-1">
                    {[-90, 0, 90, 180].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => updateElement(activeElement.id, { rotation: deg })}
                        className="flex-1 bg-slate-950 hover:bg-slate-800 text-[10px] text-slate-400 rounded py-1 transition-colors border border-slate-800"
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Duplicate & Delete */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => duplicateElement(activeElement.id)}
                  className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 py-2 rounded-xl text-xs font-semibold"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Duplicar</span>
                </button>
                <button
                  onClick={() => removeElement(activeElement.id)}
                  className="flex items-center justify-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 py-2 rounded-xl text-xs font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Opciones de Objeto (Image 2) */}
      {activeTab === 'parts' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Opciones de objeto</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">Camiseta</span>
          </div>

          {/* Colores por zona */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-sky-400">Colores</h4>

            <div className="space-y-2">
              {[
                { id: 'front', label: 'Parte delantera (diseño)', color: frontDesignColor, setColor: (c: string) => setZoneColor('front', c) },
                { id: 'back', label: 'Parte trasera (diseño)', color: backDesignColor, setColor: (c: string) => setZoneColor('back', c) },
                { id: 'sleeveSeams', label: 'Costuras de las mangas', color: sleeveSeamsColor, setColor: (c: string) => setZoneColor('sleeveSeams', c) },
                { id: 'leftSleeve', label: 'Manga izquierda', color: leftSleeveColor, setColor: (c: string) => setZoneColor('leftSleeve', c) },
                { id: 'rightSleeve', label: 'Manga derecha', color: rightSleeveColor, setColor: (c: string) => setZoneColor('rightSleeve', c) },
                { id: 'collarSeams', label: 'Costuras superiores', color: collarSeamsColor, setColor: (c: string) => setZoneColor('collarSeams', c) },
              ].map((part) => (
                <div key={part.id} className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-3">
                    {/* Visual Color Swatch Box (Matching Image 2) */}
                    <div
                      className="w-7 h-7 rounded-lg border-2 border-slate-600 shadow-md relative cursor-pointer overflow-hidden shrink-0 transition-transform hover:scale-105"
                      style={{ backgroundColor: part.color }}
                      title={`Cambiar color de ${part.label}`}
                    >
                      <input
                        type="color"
                        value={part.color}
                        onChange={(e) => part.setColor(e.target.value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                    </div>
                    <span className="text-xs text-slate-200 font-medium flex-1">{part.label}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 uppercase">
                      {part.color}
                    </span>
                  </div>

                  {/* Quick Color Swatches */}
                  <div className="flex items-center gap-1.5 pl-10">
                    {['#ffffff', '#111111', '#dc2626', '#2563eb', '#16a34a', '#eab308', '#9333ea', '#ea580c'].map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => part.setColor(hex)}
                        className={`w-3.5 h-3.5 rounded-full border transition-all ${
                          part.color.toLowerCase() === hex.toLowerCase() ? 'scale-125 border-white ring-1 ring-sky-400' : 'border-slate-700 hover:scale-110'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visibilidad (Checkboxes) */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-sky-400">Visibilidad</h4>

            <div className="space-y-1.5">
              {[
                { id: 'sleeveSeams', label: 'Costuras de las mangas', checked: showSleeveSeams },
                { id: 'collarSeams', label: 'Costuras superiores', checked: showCollarSeams },
                { id: 'leftSleeve', label: 'Manga izquierda', checked: showLeftSleeve },
                { id: 'rightSleeve', label: 'Manga derecha', checked: showRightSleeve },
              ].map((vis) => (
                <label
                  key={vis.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-900/60 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={vis.checked}
                    onChange={() => toggleZoneVisibility(vis.id as any)}
                    className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-700 accent-sky-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-300 select-none">{vis.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Configuraciones de Materiales (Image 3) */}
      {activeTab === 'materials' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-sky-400">Configuraciones de Materiales</h3>
            <button
              onClick={resetFabricProperties}
              title="Restablecer valores por defecto"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Tela</span>
              <button
                onClick={resetFabricProperties}
                className="text-slate-400 hover:text-white"
                title="Restablecer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tasa de Reflexión (Brillo) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Tasa de Reflexión (Brillo)</span>
                <span className="font-mono text-sky-400 font-bold">{fabricReflectivity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={fabricReflectivity}
                onChange={(e) => setFabricProperty('fabricReflectivity', parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Rugosidad */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Rugosidad</span>
                <span className="font-mono text-sky-400 font-bold">{fabricRoughness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={fabricRoughness}
                onChange={(e) => setFabricProperty('fabricRoughness', parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Metalicidad */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Metalicidad</span>
                <span className="font-mono text-sky-400 font-bold">{fabricMetalness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={fabricMetalness}
                onChange={(e) => setFabricProperty('fabricMetalness', parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Transparencia */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Transparencia</span>
                <span className="font-mono text-sky-400 font-bold">{fabricOpacity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.01}
                value={fabricOpacity}
                onChange={(e) => setFabricProperty('fabricOpacity', parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
