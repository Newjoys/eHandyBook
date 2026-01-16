
import React, { useState, useRef, useEffect } from 'react';
import { NodeData } from '../types';
import { ChevronUp, Play, Music, Film, Type as TypeIcon, Scissors, Star } from 'lucide-react';

interface InteractiveNodeProps {
  node: NodeData;
  isSelected: boolean;
  isConnecting: boolean;
  readOnly?: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onToggleOpen: () => void;
  onConnect: () => void;
  onDelete: () => void;
  onStartConnecting: () => void;
}

export const InteractiveNode: React.FC<InteractiveNodeProps> = ({
  node,
  isSelected,
  isConnecting,
  readOnly = false,
  onSelect,
  onMove,
  onToggleOpen,
  onConnect,
  onDelete,
  onStartConnecting
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (node.props.audioUrl) {
      audioRef.current = new Audio(node.props.audioUrl);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [node.props.audioUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error("Playback failed", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    if (isConnecting) {
      onConnect();
      return;
    }
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !readOnly) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        onMove(node.x + dx, node.y + dy);
        dragStart.current = { x: e.clientX, y: e.clientY };
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onMove, readOnly, node.x, node.y]);

  const getBackgroundStyle = (pattern: string) => {
    const patterns: Record<string, string> = {
      'kraft': 'url("https://www.transparenttextures.com/patterns/creampaper.png")',
      'noise': 'url("https://www.transparenttextures.com/patterns/60-lines.png")',
      'newspaper': 'url("https://www.transparenttextures.com/patterns/pinstriped-suit.png")',
      'grid': 'url("https://www.transparenttextures.com/patterns/grid-me.png")',
      'none': 'none'
    };
    return patterns[pattern] || 'none';
  };

  const renderContent = () => {
    const { type, isOpen, props, imgBg } = node;

    switch (type) {
      case 'text':
        return (
          <div 
            className={`flex items-center justify-center text-center relative overflow-hidden transition-all shadow-sm ${readOnly ? 'cursor-default' : 'cursor-text'}`}
            style={{ 
              fontSize: `${props.fontSize}px`, color: props.color, fontFamily: props.fontFamily || 'Outfit',
              width: `${props.width || 200}px`, padding: `${props.padding || 12}px`,
              backgroundColor: props.bgColor || 'transparent', backgroundImage: getBackgroundStyle(props.bgPattern),
              borderColor: props.borderColor || '#cbd5e1', borderWidth: `${props.borderWidth || 0}px`,
              borderStyle: props.borderStyle || 'solid', borderRadius: `${props.borderRadius || 0}px`,
              lineHeight: 1.2
            }}
          >
            {props.text}
          </div>
        );

      case 'sticker': {
        const isCustomSticker = props.sticker && (props.sticker.startsWith('http') || props.sticker.startsWith('data:'));
        return (
          <div className="flex items-center justify-center transition-transform group/sticker" style={{ transform: `rotate(${props.rotate}deg)`, width: `${props.size * 1.2}px`, height: `${props.size * 1.2}px`, userSelect: 'none' }}>
            {isCustomSticker ? <img src={props.sticker} className="w-full h-full object-contain drop-shadow-md transition-transform group-hover/sticker:scale-110" draggable={false} /> : <span style={{ fontSize: `${props.size}px` }} className="drop-shadow-sm group-hover/sticker:scale-110 transition-transform">{props.sticker}</span>}
          </div>
        );
      }

      case 'filmroll': {
        const rawImages = props.images ? props.images.split(',') : [];
        const filmImages = rawImages.length > 0 ? rawImages.filter((i: string) => i.trim().length > 0) : [imgBg];
        return (
          <div className="relative flex items-center group/film" onClick={(e) => { e.stopPropagation(); onToggleOpen(); }}>
            <div className="relative rounded-[2rem] shadow-2xl z-30 flex flex-col items-center justify-center overflow-hidden border-2 border-black/10 cursor-pointer" style={{ backgroundColor: props.color || '#FFB800', width: `${props.width || 96}px`, height: `${props.height || 160}px` }}>
              <div className="absolute top-0 inset-x-0 h-[15%] bg-slate-900 shadow-inner flex items-center justify-center"></div>
              <div className="relative z-10 flex flex-col items-center gap-1 select-none pointer-events-none p-2 text-center">
                <span className="font-black text-slate-900 leading-none tracking-tighter" style={{ fontSize: `${(props.width || 96) * 0.15}px` }}>{props.title || 'FILM 400'}</span>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-[15%] bg-slate-900 shadow-inner"></div>
            </div>
            <div className={`absolute left-[70%] h-[80%] bg-[#1a1a1a] shadow-2xl transition-all duration-700 ease-in-out z-20 flex items-center px-6 overflow-hidden origin-left`} style={{ width: isOpen ? `${filmImages.length * ((props.height || 160) * 0.75) + 40}px` : '0px', opacity: isOpen ? 1 : 0, borderRadius: '0 12px 12px 0' }}>
              <div className="flex gap-4">{filmImages.map((img: string, idx: number) => <div key={idx} className="bg-slate-800 rounded-sm overflow-hidden flex-shrink-0 border border-white/10" style={{ width: `${(props.height || 160) * 0.6}px`, height: `${(props.height || 160) * 0.6}px` }}><img src={img} className="w-full h-full object-cover" /></div>)}</div>
            </div>
          </div>
        );
      }

      case 'record':
        return (
          <div className="relative bg-white p-3 rounded-2xl shadow-2xl border-b-8 border-slate-200 group/record cursor-pointer" onClick={togglePlay} style={{ width: `${props.width || 208}px`, height: `${props.height || 176}px` }}>
             <div className="absolute inset-0 rounded-2xl shadow-inner z-0" style={{ backgroundColor: props.color }}></div>
             <div className="relative h-full flex items-center justify-between z-10 px-1">
                <div className={`relative rounded-full border-[6px] border-[#1a1a1a] shadow-xl overflow-hidden flex items-center justify-center ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} style={{ width: `${(props.width || 208) * 0.6}px`, height: `${(props.width || 208) * 0.6}px` }}>
                   <div className="rounded-full overflow-hidden border-2 border-white/20 z-10 w-[40%] h-[40%]"><img src={imgBg} className="w-full h-full object-cover" /></div>
                </div>
                <div className="flex-1 h-full flex flex-col items-center justify-center py-2 overflow-hidden">
                   <div className="bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-[8px] font-black uppercase tracking-widest text-center truncate w-full">{isPlaying ? 'Playing...' : props.title}</div>
                </div>
             </div>
          </div>
        );

      case 'drawer':
        return (
          <div className="relative flex items-center cursor-pointer group/drawer" onClick={(e) => { e.stopPropagation(); onToggleOpen(); }} style={{ width: props.width || 192, height: props.height || 112 }}>
            <div className="relative z-20 w-full h-full bg-slate-100 rounded-xl border-4 border-white shadow-xl flex items-center justify-center" style={{ backgroundColor: props.color }}>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{props.title}</span>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-black/10 rounded-full"></div>
            </div>
            <div className={`absolute left-0 z-10 h-[80%] bg-white rounded-r-lg shadow-xl transition-all duration-700 ease-out border-y border-r border-slate-200 overflow-hidden`} style={{ width: isOpen ? '90%' : '0', transform: isOpen ? 'translateX(90%)' : 'translateX(0)', opacity: isOpen ? 1 : 0 }}>
               <img src={imgBg} className="w-full h-full object-cover" />
            </div>
          </div>
        );

      case 'flipbox':
        return (
          <div className="perspective-1000 cursor-pointer" onClick={(e) => { e.stopPropagation(); onToggleOpen(); }} style={{ width: props.width || 160, height: props.height || 160 }}>
            <div className={`relative w-full h-full transition-transform duration-1000 preserve-3d`} style={{ transform: isOpen ? 'rotateY(180deg)' : 'rotateY(0)' }}>
              <div className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-xl border-4 border-white flex flex-col items-center justify-center p-4 text-center" style={{ backgroundColor: props.color }}>
                <Star className="text-white mb-2" />
                <span className="text-xs font-black text-white uppercase tracking-widest leading-tight">{props.title}</span>
              </div>
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-50 rounded-2xl shadow-xl overflow-hidden">
                <img src={imgBg} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        );

      case 'news':
        return (
          <div className="cursor-pointer overflow-visible" onClick={(e) => { e.stopPropagation(); onToggleOpen(); }} style={{ width: isOpen ? (props.width || 256) : (props.width || 256) * 0.6, height: isOpen ? (props.height || 320) : (props.height || 320) * 0.4 }}>
             <div className={`w-full h-full bg-[#f4f1ea] border border-slate-300 shadow-2xl transition-all duration-700 origin-top flex flex-col p-4 overflow-hidden relative ${isOpen ? 'rotate-x-0' : 'rotate-x-45'}`}>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] pointer-events-none"></div>
                <h3 className="font-black text-slate-800 uppercase leading-none border-b-2 border-slate-800 pb-2 mb-2" style={{ fontSize: isOpen ? '1.2rem' : '0.6rem' }}>{props.title}</h3>
                <div className="flex-1 flex gap-2">
                   <div className="flex-1 space-y-2">
                     <div className="w-full h-2 bg-slate-300 rounded"></div>
                     <div className="w-[80%] h-2 bg-slate-300 rounded"></div>
                     {isOpen && <div className="w-full h-24 bg-slate-200 rounded overflow-hidden"><img src={imgBg} className="w-full h-full object-cover" /></div>}
                     <div className="w-full h-2 bg-slate-300 rounded"></div>
                   </div>
                </div>
             </div>
          </div>
        );

      case 'accordion':
        return (
          <div className="flex items-center cursor-pointer group/accordion" onClick={(e) => { e.stopPropagation(); onToggleOpen(); }} style={{ height: props.height || 128 }}>
             {Array.from({ length: 4 }).map((_, i) => (
               <div 
                 key={i} 
                 className="h-full bg-white border border-slate-200 shadow-lg relative overflow-hidden transition-all duration-700 ease-in-out" 
                 style={{ 
                   width: isOpen ? `${(props.width || 192) / 4}px` : '10px',
                   transform: `skewY(${i % 2 === 0 ? '5deg' : '-5deg'}) translateX(${(i * (isOpen ? 0 : -8))}px)`,
                   zIndex: 4 - i,
                 }}
               >
                 <img src={imgBg} className="absolute inset-0 w-full h-full object-cover opacity-60" style={{ left: `-${i * 100}%`, width: `${(props.width || 192)}px` }} />
                 {i === 0 && <div className="absolute inset-0 flex items-center justify-center p-2"><span className="text-[8px] font-black text-slate-800 rotate-90">{props.title}</span></div>}
               </div>
             ))}
          </div>
        );

      case 'wanted':
        return (
          <div className="relative group/wanted cursor-pointer overflow-hidden border-8 border-[#d2b48c] shadow-2xl bg-[#f5deb3]" onClick={(e) => { e.stopPropagation(); onToggleOpen(); }} style={{ width: props.width || 192, height: props.height || 256 }}>
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/creampaper.png')]"></div>
             <div className="flex flex-col items-center p-4">
               <h2 className="font-black text-slate-900 uppercase text-2xl tracking-tighter mb-1">Wanted</h2>
               <div className="w-full aspect-square border-4 border-slate-900 mb-2 relative overflow-hidden">
                  <img src={imgBg} className={`w-full h-full object-cover transition-all duration-1000 ${isOpen ? 'grayscale-0 scale-100' : 'grayscale scale-110 blur-sm'}`} />
               </div>
               <p className="text-xl font-black text-slate-900 tracking-widest">{props.title}</p>
             </div>
             <div className={`absolute inset-0 bg-red-600/20 mix-blend-multiply transition-opacity duration-700 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></div>
          </div>
        );

      case 'polaroid':
        return (
          <div className="bg-white p-3 pt-3 pb-8 shadow-2xl rounded-sm transition-transform duration-500 cursor-pointer hover:rotate-2" style={{ width: props.width || 128, transform: isOpen ? 'rotate(-5deg) scale(1.1)' : 'rotate(2deg)' }} onClick={(e) => { e.stopPropagation(); onToggleOpen(); }}>
             <div className="w-full aspect-square bg-slate-100 overflow-hidden relative mb-2">
               <img src={imgBg} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-white/20 pointer-events-none"></div>
             </div>
             <p className="handwritten text-[10px] text-slate-600 leading-tight text-center">{props.title}</p>
          </div>
        );

      case 'suit':
        return (
          <div className="relative flex flex-col items-center justify-end group/suit cursor-pointer" onClick={(e) => { e.stopPropagation(); onToggleOpen(); }} style={{ width: props.width || 192, height: props.height || 224 }}>
            <div className={`absolute left-1/2 -translate-x-1/2 w-[40%] transition-all duration-700 ease-in-out z-10`} style={{ height: isOpen ? '40%' : '10%', bottom: '65%' }}><div className="w-full h-full border-x-4 border-t-4 border-slate-400 rounded-t-xl relative"><div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[110%] h-3 bg-slate-600 rounded-full"></div></div></div>
            <div className={`absolute bg-white p-2 shadow-2xl transition-all duration-700 ease-out border border-slate-200 z-10 ${isOpen ? '-translate-y-[90%]' : '-translate-y-[10%] scale-95 opacity-0'}`} style={{ transformOrigin: 'bottom', width: (props.width || 192) * 0.8 }}><div className="w-full h-32 bg-slate-100 overflow-hidden"><img src={imgBg} className="w-full h-full object-cover" /></div><p className="mt-2 text-[10px] text-center font-bold text-slate-600 truncate">{props.title}</p></div>
            <div className="relative w-full h-[70%] rounded-3xl border-4 border-white shadow-2xl overflow-hidden z-20 flex flex-col" style={{ backgroundColor: props.color }}>{!isOpen && <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 animate-bounce pointer-events-none"><ChevronUp size={24} /><span className="text-[8px] font-bold uppercase tracking-widest">Pull Me</span></div>}</div>
          </div>
        );

      case 'window':
        return (
          <div className="relative bg-white p-2 shadow-2xl rounded-sm overflow-hidden group/window cursor-pointer" onClick={(e) => { e.stopPropagation(); onToggleOpen(); }} style={{ width: props.width || 192, height: props.height || 192 }}>
            <div className="absolute inset-2 bg-slate-900 overflow-hidden"><img src={imgBg} className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover/window:scale-110" /></div>
            <div className="absolute top-2 bottom-2 left-2 w-[calc(50%-8px)] z-20 border-r border-slate-300 shadow-lg transition-transform duration-700 ease-in-out origin-left" style={{ backgroundColor: props.color, transform: isOpen ? 'perspective(1000px) rotateY(-110deg)' : 'rotateY(0deg)' }}></div>
            <div className="absolute top-2 bottom-2 right-2 w-[calc(50%-8px)] z-20 border-l border-slate-300 shadow-lg transition-transform duration-700 ease-in-out origin-right" style={{ backgroundColor: props.color, transform: isOpen ? 'perspective(1000px) rotateY(110deg)' : 'rotateY(0deg)' }}></div>
          </div>
        );

      case 'envelope': {
        const eWidth = props.w || 240;
        const eHeight = props.h || 160;
        const envelopeColor = props.color || '#E5D3B3';
        return (
          <div className="relative cursor-pointer select-none group/envelope" style={{ width: eWidth, height: eHeight }} onClick={(e) => { e.stopPropagation(); onToggleOpen(); }}>
            {/* 1. Bottom Layer (Back) */}
            <div className="absolute inset-0 rounded-sm shadow-inner z-0 border border-black/5" style={{ backgroundColor: envelopeColor, filter: 'brightness(0.9)' }}></div>
            
            {/* 2. Middle Layer (Letter) */}
            <div 
              className={`absolute inset-x-3 bottom-2 bg-white transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-xl flex flex-col border border-slate-200 ${isOpen ? '-translate-y-[85%] z-20' : 'translate-y-0 z-[5]'}`}
              style={{ 
                height: '90%', 
                fontFamily: props.fontFamily || 'Shadows Into Light', 
                fontSize: `${props.fontSize || 14}px`, 
                color: props.textColor || '#444' 
              }}
            >
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]"></div>
              <div className="flex-1 p-4 whitespace-pre-wrap overflow-hidden leading-relaxed">
                {props.letterText}
              </div>
              {node.imgBg && (
                <div className="px-4 pb-4">
                  <div className="w-full h-16 bg-slate-50 border border-slate-100 rounded overflow-hidden">
                    <img src={node.imgBg} className="w-full h-full object-cover grayscale-[0.3]" />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Top Layer (Front with Signature) */}
            <div className="absolute inset-0 z-30 flex flex-col justify-between overflow-hidden rounded-sm border-2 border-black/5 pointer-events-none" style={{ backgroundColor: envelopeColor }}>
               {/* Decorative Lines/Patterns */}
               <div className="absolute top-4 left-0 right-0 h-px bg-black/10"></div>
               <div className="absolute bottom-4 left-0 right-0 h-px bg-black/10"></div>
               
               {/* Side Text */}
               <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[7px] font-black text-slate-800/40 uppercase whitespace-nowrap tracking-tighter">
                  Shakespeare's Wild Sisters Group
               </div>
               <div className="absolute right-1 top-1/2 -translate-y-1/2 rotate-90 text-[7px] font-black text-slate-800/40 uppercase whitespace-nowrap tracking-tighter">
                  Shakespeare's Wild Sisters Group
               </div>
               
               {/* Center Logo Area */}
               <div className="flex-1 flex flex-col items-center justify-center pt-2">
                  <div className="relative group-hover/envelope:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 blur-md bg-white/30 rounded-full"></div>
                    <div className="relative w-16 h-8 border-[1.5px] border-slate-900/60 rounded-full flex items-center justify-center font-black text-[10px] tracking-tight bg-white/10">
                      SWSG
                    </div>
                  </div>
                  <div className="mt-2 w-1/3 h-[2px] bg-slate-900/10 rounded-full"></div>
                  <div className="mt-1 text-[6px] font-black uppercase tracking-[0.2em] text-slate-800/50">
                    Private & Confidential
                  </div>
               </div>

               {/* Stamp Placeholder */}
               <div className="absolute top-2 right-2 w-8 h-10 border-2 border-dashed border-black/10 rounded-sm flex items-center justify-center">
                  <span className="text-[6px] font-black text-black/10 rotate-12">AIR MAIL</span>
               </div>

               {/* Interactive Heart Indicator */}
               <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white text-[12px] transition-all duration-500 shadow-lg ${isOpen ? 'opacity-0 scale-50' : 'bg-rose-500 opacity-100 scale-100'}`}>
                 ♥
               </div>
            </div>
          </div>
        );
      }

      default:
        return <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-lg" onClick={(e) => { e.stopPropagation(); onToggleOpen(); }}>{type} {isOpen ? 'Open' : 'Closed'}</div>;
    }
  };

  return (
    <div className={`absolute transition-shadow duration-200 ${isSelected ? 'z-[100]' : 'z-10'}`} style={{ left: node.x, top: node.y }} onMouseDown={handleMouseDown}>
      <div className={`relative group ${isSelected && !readOnly ? 'ring-4 ring-indigo-500/50 ring-offset-4 ring-offset-[#F0F2F5] rounded-xl' : ''}`}>
        {renderContent()}
        {!readOnly && (
          <div className={`absolute -top-14 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-slate-900/90 backdrop-blur rounded-2xl border border-white/10 shadow-2xl z-[110]`}>
             <button onClick={(e) => { e.stopPropagation(); onStartConnecting(); }} className="w-8 h-8 flex items-center justify-center bg-indigo-500 hover:bg-indigo-400 rounded-xl text-white transition-colors" title="建立连接"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></button>
             <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-8 h-8 flex items-center justify-center bg-rose-500 hover:bg-rose-400 rounded-xl text-white transition-colors" title="删除"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>
          </div>
        )}
      </div>
    </div>
  );
};
