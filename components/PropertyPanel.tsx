
import React, { useState } from 'react';
import { NodeData, PropDefinition } from '../types';
import { TEMPLATES } from '../constants';
import { generateJournalText } from '../services/geminiService';
import { Wand2, Trash2, Link as LinkIcon, Image as ImageIcon, Music, Plus, X, ChevronDown } from 'lucide-react';

interface PropertyPanelProps {
  selectedNode: NodeData | null;
  onUpdateProps: (props: Record<string, any>) => void;
  onUpdateNode: (data: Partial<NodeData>) => void;
  onDelete: () => void;
  onStartConnecting: () => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedNode,
  onUpdateProps,
  onUpdateNode,
  onDelete,
  onStartConnecting
}) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  if (!selectedNode) {
    return (
      <aside className="w-80 bg-white border-l border-slate-200 flex flex-col items-center justify-center p-8 text-center shadow-xl">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
          <Wand2 className="text-slate-300" size={32} />
        </div>
        <h3 className="text-slate-800 font-bold text-lg mb-2">未选中元素</h3>
        <p className="text-xs text-slate-400 leading-relaxed">在画布上选择一个元素，即可自定义其属性、内容和风格。</p>
      </aside>
    );
  }

  const tpl = TEMPLATES.find(t => t.type === selectedNode.type);
  if (!tpl) return null;

  const handleAiMagic = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    const result = await generateJournalText(aiPrompt, selectedNode.type);
    if (result) {
      onUpdateProps({ title: result.title, text: result.description || result.title });
    }
    setIsAiLoading(false);
  };

  const handleFileUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>, isArray = false, arrayIdx?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (isArray) {
          const currentImages = selectedNode.props.images ? selectedNode.props.images.split(',') : [];
          if (arrayIdx !== undefined) {
            currentImages[arrayIdx] = result;
          } else {
            currentImages.push(result);
          }
          onUpdateProps({ images: currentImages.join(',') });
        } else {
          if (key === 'audioUrl') {
            onUpdateProps({ [key]: result });
          } else {
            onUpdateNode({ [key as any]: result });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFilmImage = (idx: number) => {
    const currentImages = selectedNode.props.images ? selectedNode.props.images.split(',') : [];
    currentImages.splice(idx, 1);
    onUpdateProps({ images: currentImages.join(',') });
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
           <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> 元素配置
        </h2>
        <span className="text-[10px] px-2 py-1 bg-white border border-slate-200 text-slate-500 rounded-md font-mono">{tpl.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* 配置参数 */}
        <section className="space-y-5">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">基础样式参数</h4>
          {tpl.props.map(p => {
            if (p.key === 'images') return null;
            return (
              <div key={p.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-600 font-bold">{p.label}</label>
                  {p.type === 'range' && <span className="text-[10px] text-indigo-500 font-black">{selectedNode.props[p.key]}{p.unit}</span>}
                </div>

                {p.type === 'range' && (
                  <input 
                    type="range" 
                    min={p.min} max={p.max} 
                    value={selectedNode.props[p.key]} 
                    onChange={(e) => onUpdateProps({ [p.key]: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                )}

                {p.type === 'color' && (
                  <div className="flex gap-2 items-center bg-slate-50 p-1 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                    <input 
                      type="color" 
                      value={selectedNode.props[p.key]} 
                      onChange={(e) => onUpdateProps({ [p.key]: e.target.value })}
                      className="w-12 h-10 bg-transparent border-none cursor-pointer p-0 rounded-lg overflow-hidden"
                    />
                    <span className="text-[10px] text-slate-500 font-black font-mono uppercase tracking-widest">{selectedNode.props[p.key]}</span>
                  </div>
                )}

                {p.type === 'select' && (
                  <div className="relative">
                    <select 
                      value={selectedNode.props[p.key]}
                      onChange={(e) => onUpdateProps({ [p.key]: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all pr-10"
                    >
                      {p.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  </div>
                )}

                {p.type === 'text' && (
                  <textarea 
                    value={selectedNode.props[p.key]} 
                    onChange={(e) => onUpdateProps({ [p.key]: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none h-24 font-medium"
                    placeholder="请输入..."
                  />
                )}
              </div>
            );
          })}
        </section>

        {/* 胶卷专用配置 */}
        {selectedNode.type === 'filmroll' && (
          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">胶卷相册内容 ({selectedNode.props.images?.split(',').filter(Boolean).length || 0})</h4>
            <div className="grid grid-cols-2 gap-3">
              {(selectedNode.props.images ? selectedNode.props.images.split(',') : []).map((img: string, idx: number) => (
                <div key={idx} className="relative group aspect-square rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shadow-sm">
                  <img src={img} className="w-full h-full object-cover" />
                  <button onClick={() => removeFilmImage(idx)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-400 hover:text-indigo-500 transition-all bg-indigo-50/20">
                <Plus size={24} />
                <span className="text-[8px] font-black mt-1 uppercase tracking-widest">添加图片</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('images', e, true)} />
              </label>
            </div>
          </section>
        )}

        {/* 多媒体资源库 */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">多媒体库</h4>
          <div className="space-y-3">
             <div className="relative group overflow-hidden rounded-[1.5rem] bg-slate-50 border border-slate-200 aspect-video shadow-sm">
                <img src={selectedNode.imgBg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 bg-black/50 text-white font-black text-[10px] transition-all backdrop-blur-sm uppercase tracking-widest">
                   <ImageIcon size={24} className="mb-2" />
                   更新背景
                   <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('imgBg', e)} />
                </label>
             </div>
             {selectedNode.type === 'record' && (
               <div className="relative p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Music size={18} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black text-indigo-900 uppercase">音频素材</p>
                    <p className="text-[8px] text-indigo-400 font-bold">点击按钮上传音频文件</p>
                  </div>
                  <label className="px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-[10px] font-black cursor-pointer hover:bg-indigo-600 hover:text-white shadow-sm transition-all border border-indigo-100">
                    上传
                    <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileUpload('audioUrl', e)} />
                  </label>
               </div>
             )}
          </div>
        </section>

        {/* AI 内容生成助手 */}
        <section className="bg-slate-900 p-6 rounded-[2rem] space-y-4 shadow-2xl">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center">
                <Wand2 size={16} className="text-white" />
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest">AI 创意联想</h4>
           </div>
           <div className="relative">
              <input 
                type="text" 
                placeholder="灵感关键词..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none pr-12 focus:ring-2 focus:ring-indigo-500/50"
              />
              <button 
                onClick={handleAiMagic}
                disabled={isAiLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shadow-lg"
              >
                {isAiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Wand2 size={14} />}
              </button>
           </div>
        </section>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/30 grid grid-cols-4 gap-3">
         <button onClick={onStartConnecting} className="col-span-3 flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">
           <LinkIcon size={14} /> 建立逻辑关联
         </button>
         <button onClick={onDelete} className="flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white rounded-2xl transition-all active:scale-95 shadow-lg shadow-rose-200">
           <Trash2 size={20} />
         </button>
      </div>
    </aside>
  );
};
