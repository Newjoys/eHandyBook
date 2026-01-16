
import React, { useState, useRef } from 'react';
import { X, Wand2, Scissors, RotateCcw, Save, Sparkles, Loader2 } from 'lucide-react';
import { modifyStickerWithAI } from '../services/geminiService';

interface StickerEditorProps {
  image: string;
  onSave: (editedImage: string) => void;
  onClose: () => void;
}

export const StickerEditor: React.FC<StickerEditorProps> = ({ image, onSave, onClose }) => {
  const [currentImage, setCurrentImage] = useState(image);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleRemoveBackground = async () => {
    setIsProcessing(true);
    // Simple mock of background removal logic: in a real app, this would use a model or a canvas manipulation technique
    // Here we simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demonstration, we'll just keep the current image but pretend we processed it
    // Real implementation would use an edge detection or ML model
    setIsProcessing(false);
  };

  const handleAiEdit = async () => {
    if (!aiPrompt) return;
    setIsProcessing(true);
    const result = await modifyStickerWithAI(currentImage, aiPrompt);
    if (result) {
      setCurrentImage(result);
    }
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-8">
      <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[80vh] flex overflow-hidden shadow-2xl">
        <div className="flex-1 bg-slate-50 flex items-center justify-center relative p-12">
           <div className="absolute top-8 left-8 text-slate-400 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Editing Area</span>
           </div>
           
           <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <img 
                src={currentImage} 
                className={`max-w-full max-h-[60vh] relative z-10 transition-transform ${isProcessing ? 'scale-95 blur-sm' : 'scale-100'}`} 
                alt="Editing" 
              />
              {isProcessing && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 text-indigo-600">
                  <Loader2 className="animate-spin" size={48} />
                  <span className="text-xs font-black uppercase tracking-widest bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-lg">Processing Magic...</span>
                </div>
              )}
           </div>
        </div>

        <div className="w-96 border-l border-slate-100 p-8 flex flex-col gap-8 bg-white">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-black text-slate-800 tracking-tight">贴纸编辑器</h2>
             <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
               <X size={20} />
             </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">一键智能工具</h3>
              <button 
                onClick={handleRemoveBackground}
                disabled={isProcessing}
                className="w-full flex items-center gap-3 p-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50"
              >
                <Scissors size={20} />
                <span>智能去除背景</span>
              </button>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI 风格重塑</h3>
              <div className="space-y-3">
                <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="例如：将贴纸颜色改为粉色调，并添加一点复古噪点..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none h-32 transition-all"
                />
                <button 
                  onClick={handleAiEdit}
                  disabled={isProcessing || !aiPrompt}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles size={18} />
                  <span>AI 一键修改</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-auto flex gap-3">
            <button 
              onClick={() => setCurrentImage(image)} 
              className="flex-1 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> 重置
            </button>
            <button 
              onClick={() => onSave(currentImage)}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> 保存应用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
