
import React, { useState } from 'react';
import { TEMPLATES, getIcon } from '../constants';
import { NodeType, UserSticker } from '../types';
import { Wrench, Puzzle, Palette, Image as ImageIcon, Sparkles } from 'lucide-react';

interface SidebarProps {
  onAddNode: (type: NodeType, x: number, y: number, customProps?: Record<string, any>) => void;
  userStickers: UserSticker[];
}

type SidebarTab = 'basic' | 'interactive' | 'stickers';

export const Sidebar: React.FC<SidebarProps> = ({ onAddNode, userStickers }) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('basic');

  const handleDragStart = (e: React.DragEvent, type: NodeType, customProps?: Record<string, any>) => {
    e.dataTransfer.setData('nodeType', type);
    if (customProps) {
      e.dataTransfer.setData('customProps', JSON.stringify(customProps));
    }
  };

  const basicTools = TEMPLATES.filter(t => t.type === 'text');
  const interactiveTemplates = TEMPLATES.filter(t => t.type !== 'text' && t.type !== 'sticker');
  const defaultStickersTemplate = TEMPLATES.find(t => t.type === 'sticker');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="p-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">✍️ 创作基石</h2>
            <div className="grid grid-cols-2 gap-3">
              {basicTools.map((tpl) => (
                <div
                  key={tpl.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tpl.type)}
                  onClick={() => onAddNode(tpl.type, 100, 100)}
                  className="group p-4 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl cursor-grab transition-all duration-200 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-95"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-white flex items-center justify-center shadow-inner transition-colors">
                    {getIcon(tpl.icon, 28)}
                  </div>
                  <p className="text-[10px] font-black text-slate-600 group-hover:text-indigo-600 transition-colors">
                    {tpl.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'interactive':
        return (
          <div className="p-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">🧩 交互卡片库</h2>
            <div className="grid grid-cols-2 gap-3">
              {interactiveTemplates.map((tpl) => (
                <div
                  key={tpl.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tpl.type)}
                  onClick={() => onAddNode(tpl.type, 100, 100)}
                  className="group p-4 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl cursor-grab transition-all duration-200 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-95"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-white flex items-center justify-center shadow-inner transition-colors">
                    {getIcon(tpl.icon, 28)}
                  </div>
                  <p className="text-[10px] font-black text-slate-600 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                    {tpl.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'stickers':
        return (
          <div className="p-6 animate-in fade-in slide-in-from-left-4 duration-300 overflow-y-auto max-h-full">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">🎨 内置贴纸 (Emoji)</h2>
            <div className="grid grid-cols-4 gap-2 mb-8">
              {defaultStickersTemplate?.props.find(p => p.key === 'sticker')?.options?.map((opt) => (
                <div
                  key={opt.value}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'sticker', { sticker: opt.value })}
                  onClick={() => onAddNode('sticker', 100, 100, { sticker: opt.value })}
                  className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-xl cursor-grab hover:bg-indigo-50 hover:border-indigo-200 transition-all text-xl shadow-sm hover:scale-110"
                  title={opt.label}
                >
                  {opt.value}
                </div>
              ))}
            </div>

            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">📸 我的专属贴纸</h2>
            <div className="grid grid-cols-2 gap-3">
              {userStickers.map((sticker) => (
                <div
                  key={sticker.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'sticker', { sticker: sticker.url })}
                  onClick={() => onAddNode('sticker', 100, 100, { sticker: sticker.url, size: 100 })}
                  className="group p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-2xl cursor-grab transition-all duration-200 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95"
                >
                  <div className="w-full aspect-square rounded-xl bg-slate-50 group-hover:bg-white flex items-center justify-center shadow-inner transition-colors overflow-hidden p-1">
                    <img src={sticker.url} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[9px] font-black text-slate-500 group-hover:text-indigo-600 transition-colors truncate w-full text-center px-1 uppercase tracking-tighter">
                    {sticker.name}
                  </p>
                </div>
              ))}
              {userStickers.length === 0 && (
                <div className="col-span-2 py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                  <Sparkles size={24} className="mb-2 opacity-20" />
                  <p className="text-[8px] font-bold uppercase tracking-widest text-center">暂无自定义贴纸<br/>前往“形态”实验室上传</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-xl z-20">
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('basic')}
          className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'basic' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Wrench size={18} />
          <span className="text-[9px] font-black uppercase tracking-widest">基本工具</span>
          {activeTab === 'basic' && <div className="absolute bottom-0 w-8 h-[3px] bg-indigo-500 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('interactive')}
          className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'interactive' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Puzzle size={18} />
          <span className="text-[9px] font-black uppercase tracking-widest">交互组件</span>
          {activeTab === 'interactive' && <div className="absolute bottom-0 w-8 h-[3px] bg-indigo-500 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('stickers')}
          className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'stickers' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Palette size={18} />
          <span className="text-[9px] font-black uppercase tracking-widest">贴纸图库</span>
          {activeTab === 'stickers' && <div className="absolute bottom-0 w-8 h-[3px] bg-indigo-500 rounded-t-full"></div>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-smooth relative">
        {renderTabContent()}
      </div>
      
      <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex flex-col items-center gap-1">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">拖拽元素到画布开始创作</p>
      </div>
    </aside>
  );
};
