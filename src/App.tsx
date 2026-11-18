import React, { useState, useRef } from 'react';
import { Header } from './components/layout/Header';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightInspector } from './components/layout/RightInspector';
import { BottomToolbar } from './components/layout/BottomToolbar';
import { StudioCanvas } from './components/canvas3d/StudioCanvas';
import { ExportModal } from './components/modals/ExportModal';
import { ProjectsModal } from './components/modals/ProjectsModal';
import { OrdersModal } from './components/modals/OrdersModal';
import { Toast } from './components/common/Toast';
import { DynamicTextureManager } from './components/canvas3d/DynamicTextureManager';
import { Sliders, Wrench, X } from 'lucide-react';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [textureManager, setTextureManager] = useState<DynamicTextureManager | null>(null);

  // Mobile drawer states
  const [mobilePanel, setMobilePanel] = useState<'tools' | 'inspector' | null>(null);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* 1. Top Navigation */}
      <Header />

      {/* 2. Main Studio Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block h-full">
          <LeftSidebar />
        </div>

        {/* Center 3D Viewport */}
        <main className="flex-1 h-full relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden flex flex-col">
          {/* 3D WebGL Canvas */}
          <div className="flex-1 w-full h-full relative">
            <StudioCanvas
              canvasRef={canvasRef}
              onTextureManagerReady={setTextureManager}
            />
            {/* Bottom 3D Viewport Angles & Navigation */}
            <BottomToolbar />
          </div>

          {/* Mobile floating tool toggle buttons */}
          <div className="lg:hidden absolute top-4 left-4 z-20 flex gap-2">
            <button
              onClick={() => setMobilePanel(mobilePanel === 'tools' ? null : 'tools')}
              className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg transition-all flex items-center gap-1.5 text-xs font-bold ${
                mobilePanel === 'tools'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900/80 text-white border-slate-700'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Herramientas</span>
            </button>

            <button
              onClick={() => setMobilePanel(mobilePanel === 'inspector' ? null : 'inspector')}
              className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg transition-all flex items-center gap-1.5 text-xs font-bold ${
                mobilePanel === 'inspector'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900/80 text-white border-slate-700'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Propiedades</span>
            </button>
          </div>

          {/* Mobile Drawer Overlay */}
          {mobilePanel && (
            <div className="lg:hidden absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex">
              <div className="w-80 max-w-[85vw] h-full bg-slate-950 border-r border-slate-800 shadow-2xl relative flex flex-col">
                <button
                  onClick={() => setMobilePanel(null)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 z-40 bg-slate-900 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex-1 overflow-hidden">
                  {mobilePanel === 'tools' && <LeftSidebar />}
                  {mobilePanel === 'inspector' && <RightInspector />}
                </div>
              </div>
              <div className="flex-1" onClick={() => setMobilePanel(null)} />
            </div>
          )}
        </main>

        {/* Desktop Right Inspector */}
        <div className="hidden lg:block h-full">
          <RightInspector />
        </div>
      </div>

      {/* 3. Modals */}
      <ExportModal canvasRef={canvasRef} />
      <ProjectsModal />
      <OrdersModal />

      {/* 4. Global Toast Notifications */}
      <Toast />
    </div>
  );
}

export default App;
