import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Trash2, 
  Plus, 
  X, 
  CheckCircle2, 
  Clock, 
  Shirt,
  Calendar
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { storageService } from '../../services/storage';
import { ProjectData } from '../../types';
import { GARMENT_CONFIGS } from '../../constants/garments';

export const ProjectsModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    loadProject,
    resetProject,
    setToast,
  } = useEditorStore();

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeModal === 'projects') {
      loadList();
    }
  }, [activeModal]);

  const loadList = async () => {
    setLoading(true);
    try {
      const list = await storageService.getProjects();
      setProjects(list);
    } catch {
      setToast({ text: 'Error al consultar proyectos guardados.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (project: ProjectData) => {
    loadProject(project);
    setActiveModal(null);
    setToast({ text: `Proyecto "${project.name}" cargado con éxito.`, type: 'success' });
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await storageService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      setToast({ text: 'Proyecto eliminado.', type: 'info' });
    } catch {
      setToast({ text: 'Error al eliminar el proyecto.', type: 'error' });
    }
  };

  const handleCreateNew = () => {
    resetProject();
    setActiveModal(null);
    setToast({ text: 'Nuevo proyecto creado en blanco.', type: 'info' });
  };

  if (activeModal !== 'projects') return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Proyectos Guardados</h2>
              <p className="text-xs text-slate-400">Almacenados de forma segura en tu navegador (sin conexión)</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: New Project */}
        <button
          onClick={handleCreateNew}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Crear Nuevo Proyecto en Blanco</span>
        </button>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs">Cargando proyectos...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2">
              <p>No tienes proyectos guardados aún.</p>
              <p className="text-slate-600 text-[11px]">Usa el botón "Guardar" en la barra superior para almacenar tus diseños.</p>
            </div>
          ) : (
            projects.map((proj) => {
              const garmentName = GARMENT_CONFIGS[proj.garmentType]?.name || proj.garmentType;
              const dateStr = new Date(proj.updatedAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={proj.id}
                  onClick={() => handleSelectProject(proj)}
                  className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl border border-slate-700 flex items-center justify-center shrink-0 shadow-inner"
                      style={{ backgroundColor: proj.color }}
                    >
                      <Shirt className="w-4 h-4 text-slate-500 mix-blend-difference" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                        {proj.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{garmentName}</span>
                        <span>•</span>
                        <span className="text-amber-400/90 font-mono">Talla {proj.size}</span>
                        <span>•</span>
                        <span>{proj.elements.length} estampados</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dateStr}
                    </span>
                    <button
                      onClick={(e) => handleDeleteProject(proj.id, e)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Eliminar proyecto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
