import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

export const Toast: React.FC = () => {
  const toastMessage = useEditorStore((s) => s.toastMessage);
  const setToast = useEditorStore((s) => s.setToast);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToast]);

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-amber-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/90 text-emerald-200',
    error: 'border-red-500/30 bg-red-950/90 text-red-200',
    info: 'border-amber-500/30 bg-slate-900/95 text-slate-200',
  };

  return (
    <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl text-xs font-medium max-w-md ${borders[toastMessage.type]}`}>
        {icons[toastMessage.type]}
        <span>{toastMessage.text}</span>
        <button
          onClick={() => setToast(null)}
          className="ml-2 text-slate-400 hover:text-white p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
