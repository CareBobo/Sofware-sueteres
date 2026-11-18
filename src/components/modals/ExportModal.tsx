import React, { useState, useRef } from 'react';
import { 
  Download, 
  Share2, 
  X, 
  CheckCircle2, 
  FileText, 
  Camera, 
  Smartphone, 
  Sparkles,
  Layers,
  Ruler
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { GARMENT_CONFIGS } from '../../constants/garments';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export const ExportModal: React.FC<ExportModalProps> = ({ canvasRef }) => {
  const {
    activeModal,
    setActiveModal,
    projectName,
    garmentType,
    size,
    shirtColor,
    elements,
    setToast,
  } = useEditorStore();

  const [bgChoice, setBgChoice] = useState<'studio' | 'white' | 'transparent'>('studio');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dualPreviewUrl, setDualPreviewUrl] = useState<string | null>(null);

  if (activeModal !== 'export') return null;

  const currentGarment = GARMENT_CONFIGS[garmentType];
  const frontElements = elements.filter(e => e.side === 'front' && e.visible);
  const backElements = elements.filter(e => e.side === 'back' && e.visible);

  // Capture current 3D canvas
  const handleDownloadSnapshot = () => {
    try {
      // Find the WebGL canvas
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) {
        setToast({ text: 'No se encontró el lienzo 3D para capturar.', type: 'error' });
        return;
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${projectName.replace(/\s+/g, '_')}_3D_Vista.png`;
      link.href = dataUrl;
      link.click();

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      setToast({ text: '¡Captura 3D descargada en alta resolución!', type: 'success' });
    } catch {
      setToast({ text: 'Error al generar la captura.', type: 'error' });
    }
  };

  // Generate Dual Composition (Frente + Espalda + Ficha Técnica)
  const handleGenerateDualSheet = async () => {
    setIsGenerating(true);
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      const currentCapture = canvas ? canvas.toDataURL('image/png') : '';

      // Create composite sheet (1920x1080)
      const compCanvas = document.createElement('canvas');
      compCanvas.width = 1920;
      compCanvas.height = 1080;
      const ctx = compCanvas.getContext('2d');

      if (ctx) {
        // Background
        if (bgChoice === 'white') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 1920, 1080);
        } else if (bgChoice === 'transparent') {
          ctx.clearRect(0, 0, 1920, 1080);
        } else {
          // Sleek studio gradient
          const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
          grad.addColorStop(0, '#0b0f19');
          grad.addColorStop(1, '#1e293b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1920, 1080);
        }

        // Header Branding
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText('SHADANA 3D STUDIO', 80, 90);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '22px sans-serif';
        ctx.fillText('FICHA TÉCNICA Y MOCKUP DE PERSONALIZACIÓN PARA SUBLIMACIÓN', 80, 130);

        // Project Info Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(80, 160, 680, 240);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeRect(80, 160, 680, 240);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`PROYECTO: ${projectName.toUpperCase()}`, 110, 210);

        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`• Prenda: ${currentGarment.name}`, 110, 255);
        ctx.fillText(`• Talla seleccionada: ${size}`, 110, 290);
        ctx.fillText(`• Color de tela base: ${shirtColor}`, 110, 325);
        ctx.fillText(`• Elementos totales: ${elements.length} estampados`, 110, 360);

        // Sublimation specifications table
        ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
        ctx.fillRect(80, 430, 680, 560);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.strokeRect(80, 430, 680, 560);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('DETALLES DE IMPRESIÓN (CM REALES)', 110, 480);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '18px monospace';
        let yPos = 530;
        ctx.fillText('LADO   | ELEMENTO             | MEDIDA (CM)', 110, yPos);
        yPos += 30;
        ctx.fillText('------------------------------------------------', 110, yPos);
        yPos += 30;

        elements.forEach((el, idx) => {
          if (idx < 10) {
            const sideStr = el.side === 'front' ? 'FRENTE ' : 'ESPALDA';
            const nameStr = el.name.substring(0, 18).padEnd(20, ' ');
            const sizeStr = `${el.widthCm}×${el.heightCm} cm`;
            ctx.fillText(`${sideStr}| ${nameStr}| ${sizeStr}`, 110, yPos);
            yPos += 32;
          }
        });

        // Draw 3D Shirt Preview
        if (currentCapture) {
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => {
              // Draw centered in right area
              ctx.drawImage(img, 820, 120, 1020, 880);
              resolve();
            };
            img.src = currentCapture;
          });
        }

        // Footer watermarks
        ctx.fillStyle = '#64748b';
        ctx.font = '16px sans-serif';
        ctx.fillText('Generado profesionalmente por SHADANA 3D STUDIO • Sublimación Textil de Alta Calidad', 80, 1030);

        const finalUrl = compCanvas.toDataURL('image/png');
        setDualPreviewUrl(finalUrl);

        // Trigger download
        const link = document.createElement('a');
        link.download = `FICHA_${projectName.replace(/\s+/g, '_')}_SHADANA.png`;
        link.href = finalUrl;
        link.click();

        confetti({ particleCount: 60, spread: 80, origin: { y: 0.7 } });
        setToast({ text: '¡Ficha técnica completa y composición generada!', type: 'success' });
      }
    } catch {
      setToast({ text: 'Error al generar la ficha técnica.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  // WhatsApp Share Text
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `¡Hola! Te comparto la propuesta de diseño para sublimación creada en SHADANA 3D STUDIO:
• Proyecto: ${projectName}
• Prenda: ${currentGarment.name}
• Talla: ${size}
• Color de camiseta: ${shirtColor}
• Estampados Frente: ${frontElements.length} elemento(s)
• Estampados Espalda: ${backElements.length} elemento(s)

¡Quedo atento a tu confirmación para proceder con la fabricación!`
    );

    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Exportar y Compartir Diseño</h2>
              <p className="text-xs text-slate-400">Mockups 3D, Fichas Técnicas de Sublimación y WhatsApp</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: 3D Camera Snapshot */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1">
                <Camera className="w-4 h-4" />
                <span>Captura Vista 3D Directa</span>
              </div>
              <p className="text-xs text-slate-400">
                Descarga una imagen PNG exacta de la vista tridimensional actual con sus luces y sombras.
              </p>
            </div>
            <button
              onClick={handleDownloadSnapshot}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Descargar Captura PNG</span>
            </button>
          </div>

          {/* Card 2: Dual Ficha Técnica for Sublimation */}
          <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1">
                <FileText className="w-4 h-4" />
                <span>Ficha Técnica Completa (1080p)</span>
              </div>
              <p className="text-xs text-slate-400">
                Mockup publicitario con especificaciones en cm de cada estampado para plancha de sublimación.
              </p>
            </div>
            <button
              onClick={handleGenerateDualSheet}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generando Ficha...' : 'Generar Ficha de Sublimación'}</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Share Card */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-300">Compartir Resumen por WhatsApp</h4>
              <p className="text-[11px] text-slate-400">
                Envía al cliente o a producción el desglose de prendas, tallas y estampados.
              </p>
            </div>
          </div>
          <button
            onClick={handleWhatsAppShare}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shrink-0 transition-all shadow-md shadow-emerald-600/30"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Enviar WhatsApp</span>
          </button>
        </div>

        {/* Sublimation Production Notice */}
        <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-300">Nota para Fabricación:</strong> Esta exportación incluye la previsualización del producto y las dimensiones exactas en centímetros para calibrar las impresoras de sublimación y planchas transfer térmicas.
        </div>
      </div>
    </div>
  );
};
