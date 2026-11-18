import React, { useState } from 'react';
import { 
  Undo2, 
  Redo2, 
  Save, 
  FolderOpen, 
  Download, 
  ShoppingBag, 
  RotateCcw,
  Sparkles,
  Layers,
  Shirt
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { storageService } from '../../services/storage';

export const Header: React.FC = () => {
  const {
    projectName,
    setProjectName,
    activeSide,
    setActiveSide,
    undo,
    redo,
    canUndo,
    canRedo,
    resetProject,
    setActiveModal,
    setToast,
    garmentType,
    size,
    shirtColor,
    elements,
    currentProjectId,
  } = useEditorStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const handleSave = async () => {
    try {
      const id = currentProjectId || 'proj_' + Date.now();
      await storageService.saveProject({
        id,
        name: projectName || 'Diseño SHADANA',
        garmentType,
        size,
        color: shirtColor,
        elements,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setToast({ text: '¡Proyecto guardado exitosamente en tu navegador!', type: 'success' });
    } catch {
      setToast({ text: 'Error al guardar el proyecto localmente.', type: 'error' });
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0">
      {/* Brand & Project Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black text-lg">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-sm bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                SHADANA
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                3D STUDIO
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Sublimación Profesional</p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-2 hidden sm:block" />

        {/* Project Name editable */}
        <div className="hidden md:flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              autoFocus
              className="bg-slate-900 border border-amber-500/50 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-xs text-slate-300 hover:text-amber-400 font-medium px-2 py-1 rounded hover:bg-slate-900/60 transition-colors flex items-center gap-1.5"
              title="Clic para cambiar nombre del proyecto"
            >
              <span>{projectName}</span>
              <span className="text-[10px] text-slate-500">✏️</span>
            </button>
          )}
        </div>
      </div>

      {/* Center Side Switcher (Frente / Espalda) */}
      <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
        <button
          onClick={() => setActiveSide('front')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSide === 'front'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>Frente</span>
        </button>
        <button
          onClick={() => setActiveSide('back')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSide === 'back'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Espalda</span>
        </button>
      </div>

      {/* Right Actions: Undo/Redo, Save, Export, Orders */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="hidden lg:flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
          <button
            onClick={undo}
            disabled={!canUndo()}
            title="Deshacer (Ctrl+Z)"
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-3.5 bg-slate-800" />
          <button
            onClick={redo}
            disabled={!canRedo()}
            title="Rehacer (Ctrl+Y)"
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          title="Guardar diseño en el navegador"
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        >
          <Save className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Guardar</span>
        </button>

        {/* Projects list button */}
        <button
          onClick={() => setActiveModal('projects')}
          title="Abrir proyectos guardados"
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        >
          <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden md:inline">Proyectos</span>
        </button>

        {/* Orders button */}
        <button
          onClick={() => setActiveModal('orders')}
          title="Gestionar pedidos de clientes"
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Pedidos</span>
        </button>

        {/* Export / Share button */}
        <button
          onClick={() => setActiveModal('export')}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar</span>
        </button>
      </div>
    </header>
  );
};
