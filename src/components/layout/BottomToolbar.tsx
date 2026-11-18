import React from 'react';
import { 
  RotateCw, 
  MousePointer, 
  Trash2,
  X
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

export const BottomToolbar: React.FC = () => {
  const {
    setCameraPreset,
    cameraPreset,
    selectedElementId,
    setSelectedElementId,
    elements,
    removeElement,
  } = useEditorStore();

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  return (
    <div className="absolute bottom-5 inset-x-0 flex flex-col items-center gap-2 pointer-events-none z-10 px-4">
      {/* Floating Selected Element Action Bar */}
      {selectedElement && (
        <div className="pointer-events-auto flex items-center bg-slate-900/90 backdrop-blur-md border border-amber-500/40 rounded-2xl px-3 py-1.5 shadow-2xl gap-3 text-xs mb-1 animate-in fade-in slide-in-from-bottom-2">
          <span className="font-semibold text-slate-200 truncate max-w-44 flex items-center gap-1.5">
            <span>{selectedElement.type === 'image' ? '🖼️' : '🔤'}</span>
            <span className="truncate">{selectedElement.name}</span>
          </span>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={() => {
              removeElement(selectedElement.id);
              setSelectedElementId(null);
            }}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all active:scale-95"
            title="Eliminar este estampado y dejar limpia la prenda"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar Estampado</span>
          </button>

          <button
            onClick={() => setSelectedElementId(null)}
            className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded text-xs"
            title="Deseleccionar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive 3D angle bar */}
      <div className="pointer-events-auto flex items-center bg-slate-950/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-1.5 shadow-2xl shadow-black/80 gap-1">
        <button
          onClick={() => setCameraPreset('front')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            cameraPreset === 'front'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
          title="Vista Frontal (Frente)"
        >
          <span>Frente</span>
        </button>

        <button
          onClick={() => setCameraPreset('back')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            cameraPreset === 'back'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
          title="Vista Posterior (Espalda)"
        >
          <span>Espalda</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        <button
          onClick={() => setCameraPreset('left')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            cameraPreset === 'left'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Perfil Izquierdo"
        >
          <span>Izq.</span>
        </button>

        <button
          onClick={() => setCameraPreset('right')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            cameraPreset === 'right'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Perfil Derecho"
        >
          <span>Der.</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        <button
          onClick={() => setCameraPreset('reset')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-amber-400 hover:bg-slate-900 transition-all"
          title="Restablecer posición inicial de la cámara"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Restablecer</span>
        </button>
      </div>

      {/* Floating Info Pill */}
      <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950/70 backdrop-blur-sm border border-slate-800/80 px-3 py-1 rounded-full shadow-sm">
        <MousePointer className="w-3 h-3 text-amber-400" />
        <span>Girar: Arrastrar ratón / dedo</span>
        <span className="text-slate-600">•</span>
        <span>Zoom: Rueda / Pellizco</span>
      </div>
    </div>
  );
};
