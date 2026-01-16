
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertyPanel } from './components/PropertyPanel';
import { StickerEditor } from './components/StickerEditor';
import { NodeData, Connection, NodeType, ViewState, Scrapbook, ScrapbookCategory, Template, ScrapbookPage, PropDefinition, ScrapbookStyle, UserSticker } from './types';
import { TEMPLATES as INITIAL_TEMPLATES } from './constants';
import * as htmlToImage from 'https://esm.sh/html-to-image@1.11.11';
import { 
  Home, 
  BookText, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  Settings, 
  Trash2, 
  Edit3,
  ArrowLeft,
  ChevronLeft,
  ChevronLast,
  ChevronFirst,
  X,
  Eye,
  RotateCcw,
  Layers,
  Printer,
  Download,
  ImagePlus,
  Check
} from 'lucide-react';

const INITIAL_CATEGORIES: ScrapbookCategory[] = [
  { id: 'travel', name: '旅行日记', icon: '🌍', color: '#4dabf7' },
  { id: 'life', name: '生活碎片', icon: '🍰', color: '#ff922b' },
  { id: 'secret', name: '秘密手信', icon: '🔒', color: '#845ef7' },
];

const PAGE_TURN_SOUND = "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3";

export const LOGICAL_PAGE_WIDTH = 800;
export const LOGICAL_PAGE_HEIGHT = 1120;

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>('home');
  const [scrapbooks, setScrapbooks] = useState<Scrapbook[]>([]);
  const [categories, setCategories] = useState<ScrapbookCategory[]>(INITIAL_CATEGORIES);
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [userStickers, setUserStickers] = useState<UserSticker[]>([]);
  const [selectedScrapbookId, setSelectedScrapbookId] = useState<number | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState<'next' | 'prev' | null>(null);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [editingSticker, setEditingSticker] = useState<UserSticker | null>(null);
  const [renamingStickerId, setRenamingStickerId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<number | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewSpreadRef = useRef<HTMLDivElement>(null);
  const [editorScale, setEditorScale] = useState(0.5);

  useEffect(() => {
    audioRef.current = new Audio(PAGE_TURN_SOUND);
    const updateEditorScale = () => {
      if (editorContainerRef.current) {
        const { offsetWidth, offsetHeight } = editorContainerRef.current;
        const scaleW = (offsetWidth - 40) / LOGICAL_PAGE_WIDTH;
        const scaleH = (offsetHeight - 40) / LOGICAL_PAGE_HEIGHT;
        setEditorScale(Math.min(scaleW, scaleH));
      }
    };
    updateEditorScale();
    window.addEventListener('resize', updateEditorScale);
    return () => window.removeEventListener('resize', updateEditorScale);
  }, [activeView, selectedScrapbookId]);

  const currentScrapbook = scrapbooks.find(s => s.id === selectedScrapbookId);
  const currentPage = currentScrapbook?.pages[currentPageIndex];

  const openEditor = (id: number) => {
    setSelectedScrapbookId(id);
    setCurrentPageIndex(0);
    setActiveView('editor');
    setSelectedNodeId(null);
  };

  const handleAddNode = useCallback((type: NodeType, x: number, y: number, customProps?: Record<string, any>) => {
    if (!selectedScrapbookId) return;
    const tpl = templates.find(t => t.type === type);
    if (!tpl) return;
    
    setScrapbooks(prev => prev.map(book => {
      if (book.id !== selectedScrapbookId) return book;
      const props: Record<string, any> = {};
      tpl.props.forEach(p => props[p.key] = p.def);
      if (customProps) Object.assign(props, customProps);
      
      const newNode: NodeData = { 
        id: Date.now(), 
        type, 
        x, 
        y, 
        props, 
        imgBg: `https://picsum.photos/seed/${Math.random()}/400/300`, 
        isOpen: false 
      };
      
      const newPages = [...book.pages];
      newPages[currentPageIndex] = {
        ...newPages[currentPageIndex],
        nodes: [...newPages[currentPageIndex].nodes, newNode]
      };
      
      return { ...book, pages: newPages, lastModified: Date.now() };
    }));
    setSelectedNodeId(Date.now());
  }, [selectedScrapbookId, templates, currentPageIndex]);

  const goToPage = (index: number) => {
    if (!currentScrapbook || index < 0 || index >= currentScrapbook.pages.length || index === currentPageIndex) return;
    setIsFlipping(index > currentPageIndex ? 'next' : 'prev');
    if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}); }
    setTimeout(() => { setCurrentPageIndex(index); setSelectedNodeId(null); setIsFlipping(null); }, 400);
  };

  const handleExportImage = async () => {
    if (!previewSpreadRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(previewSpreadRef.current, { 
        quality: 1, 
        pixelRatio: 2,
        skipFonts: false
      });
      const link = document.createElement('a');
      link.download = `${currentScrapbook?.title || 'scrapbook'}_page_${currentPageIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
      alert('图片导出失败，请检查网络连接或尝试使用其他浏览器。');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadStandaloneHTML = () => {
    if (!currentScrapbook) return;
    
    const standaloneHTML = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentScrapbook.title} - 互动手账展示</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;900&family=Shadows+Into+Light&family=Space+Mono&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; background: #0f172a; color: #f8fafc; overflow: hidden; height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
        .handwritten { font-family: 'Shadows Into Light', cursive; }
        .spread-container { 
            transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1); 
            box-shadow: 0 40px 100px rgba(0,0,0,0.8); 
            display: flex; 
            border-radius: 2rem; 
            overflow: hidden; 
            background: #1e293b;
            position: relative;
        }
        .page { width: ${LOGICAL_PAGE_WIDTH}px; height: ${LOGICAL_PAGE_HEIGHT}px; background: #FCFBF4; position: relative; overflow: hidden; flex-shrink: 0; }
        .node { position: absolute; transform-origin: top left; }
        .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 9999px; cursor: pointer; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px); transition: all 0.3s; z-index: 100; }
        .nav-btn:hover { background: rgba(255,255,255,0.15); transform: translateY(-50%) scale(1.1); }
        .nav-btn.disabled { opacity: 0.1; cursor: not-allowed; }
        
        /* Interactive Component Styles */
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .rotate-x-45 { transform: rotateX(45deg); }
        .rotate-x-0 { transform: rotateX(0deg); }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin 4s linear infinite; }
    </style>
</head>
<body>
    <div id="viewer" class="flex flex-col items-center gap-6 w-full h-full p-8 justify-center">
        <h1 class="text-3xl font-black mb-4 tracking-tight">${currentScrapbook.title}</h1>
        
        <button id="prev-btn" class="nav-btn left-12"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
        <button id="next-btn" class="nav-btn right-12"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg></button>

        <div id="spread-wrapper">
          <div id="spread" class="spread-container">
              <div id="left-page" class="page" style="border-right: 2px solid rgba(0,0,0,0.1); box-shadow: inset -20px 0 40px rgba(0,0,0,0.04);"></div>
              <div id="right-page" class="page" style="background: #fff; box-shadow: inset 20px 0 40px rgba(0,0,0,0.04);"></div>
          </div>
        </div>

        <div id="dots" class="flex gap-2 mt-4"></div>
    </div>

    <script>
        const bookData = ${JSON.stringify(currentScrapbook)};
        let activeIdx = 0;
        const nodeStates = {};

        function renderNode(node) {
            const div = document.createElement('div');
            div.className = 'node';
            div.style.left = node.x + 'px';
            div.style.top = node.y + 'px';
            div.onclick = (e) => {
                e.stopPropagation();
                nodeStates[node.id] = !nodeStates[node.id];
                updateView();
            };
            
            const isOpen = nodeStates[node.id] || false;
            const p = node.props;
            let content = '';

            switch(node.type) {
                case 'text':
                    content = \`<div style="font-size:\${p.fontSize}px; color:\${p.color}; width:\${p.width}px; background:\${p.bgColor}; padding:\${p.padding}px; border-radius:\${p.borderRadius}px; border:\${p.borderWidth}px \${p.borderStyle} \${p.borderColor}; font-family:\${p.fontFamily}; line-height: 1.2;">\${p.text}</div>\`;
                    break;
                case 'sticker':
                    const isImg = p.sticker && (p.sticker.startsWith('http') || p.sticker.startsWith('data:'));
                    content = isImg 
                        ? \`<img src="\${p.sticker}" style="width:\${p.size}px; transform:rotate(\${p.rotate}deg);">\`
                        : \`<span style="font-size:\${p.size}px; transform:rotate(\${p.rotate}deg); display:inline-block;">\${p.sticker}</span>\`;
                    break;
                case 'polaroid':
                    content = \`<div class="bg-white p-3 pt-3 pb-8 shadow-xl rounded-sm transition-transform duration-500" style="width: \${p.width || 128}px; transform: \${isOpen ? 'rotate(-5deg) scale(1.1)' : 'rotate(2deg)'}">
                        <div class="w-full aspect-square bg-slate-100 overflow-hidden relative mb-2">
                           <img src="\${node.imgBg}" class="w-full h-full object-cover">
                        </div>
                        <p class="handwritten text-center text-[10px] text-slate-600">\${p.title}</p>
                    </div>\`;
                    break;
                case 'envelope':
                    content = \`<div class="relative" style="width: \${p.w || 240}px; height: \${p.h || 160}px;">
                        <div class="absolute inset-0 rounded-sm shadow-inner z-0" style="background: \${p.color || '#E5D3B3'}; filter: brightness(0.9);"></div>
                        <div class="absolute inset-x-3 bottom-2 bg-white transition-all duration-700 shadow-xl p-4 border border-slate-200 \${isOpen ? '-translate-y-[85%] z-20' : 'translate-y-0 z-[5]'}" style="height: 90%; font-family: \${p.fontFamily || 'Shadows Into Light'}; font-size: \${p.fontSize || 14}px; color: \${p.textColor || '#444'}; overflow: hidden;">
                            \${p.letterText}
                        </div>
                        <div class="absolute inset-0 z-30 rounded-sm border-2 border-black/5" style="background: \${p.color || '#E5D3B3'};">
                            <div class="absolute inset-0 flex items-center justify-center font-black text-[10px] text-slate-800/40 uppercase tracking-tighter">PRIVATE</div>
                            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] transition-all duration-500 \${isOpen ? 'opacity-0 scale-50' : 'bg-rose-500 opacity-100 scale-100'}">♥</div>
                        </div>
                    </div>\`;
                    break;
                case 'flipbox':
                    content = \`<div class="perspective-1000" style="width: \${p.width || 160}px; height: \${p.height || 160}px;">
                        <div class="relative w-full h-full preserve-3d \${isOpen ? 'rotate-y-180' : ''}">
                            <div class="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-xl border-4 border-white flex flex-col items-center justify-center p-4 text-center" style="background: \${p.color || '#4dabf7'}; color: white;">
                                <span class="text-xs font-black uppercase tracking-widest">\${p.title}</span>
                            </div>
                            <div class="absolute inset-0 backface-hidden rotate-y-180 bg-slate-50 rounded-2xl shadow-xl overflow-hidden">
                                <img src="\${node.imgBg}" class="w-full h-full object-cover">
                            </div>
                        </div>
                    </div>\`;
                    break;
                case 'drawer':
                    content = \`<div class="relative flex items-center" style="width: \${p.width || 192}px; height: \${p.height || 112}px;">
                        <div class="relative z-20 w-full h-full bg-slate-100 rounded-xl border-4 border-white shadow-xl flex items-center justify-center" style="background: \${p.color || '#F8F9FA'};">
                            <span class="text-[10px] font-black uppercase tracking-widest text-slate-800">\${p.title}</span>
                        </div>
                        <div class="absolute left-0 z-10 h-[80%] bg-white rounded-r-lg shadow-xl transition-all duration-700 ease-out border border-slate-200 overflow-hidden \${isOpen ? 'translate-x-[90%] opacity-100' : 'translate-x-0 opacity-0'}" style="width: 90%;">
                           <img src="\${node.imgBg}" class="w-full h-full object-cover">
                        </div>
                    </div>\`;
                    break;
                case 'window':
                    content = \`<div class="relative bg-white p-2 shadow-2xl rounded-sm overflow-hidden" style="width: \${p.width || 192}px; height: \${p.height || 192}px;">
                        <div class="absolute inset-2 bg-slate-900 overflow-hidden"><img src="\${node.imgBg}" class="w-full h-full object-cover opacity-90"></div>
                        <div class="absolute top-2 bottom-2 left-2 w-[calc(50%-8px)] z-20 border-r border-slate-300 transition-transform duration-700 origin-left" style="background: \${p.color || '#868e96'}; transform: \${isOpen ? 'perspective(1000px) rotateY(-110deg)' : 'rotateY(0deg)'}"></div>
                        <div class="absolute top-2 bottom-2 right-2 w-[calc(50%-8px)] z-20 border-l border-slate-300 transition-transform duration-700 origin-right" style="background: \${p.color || '#868e96'}; transform: \${isOpen ? 'perspective(1000px) rotateY(110deg)' : 'rotateY(0deg)'}"></div>
                    </div>\`;
                    break;
                case 'filmroll': {
                    const images = (p.images || '').split(',').filter(i => i.trim());
                    const filmImages = images.length > 0 ? images : [node.imgBg];
                    content = \`<div class="relative flex items-center">
                        <div class="relative rounded-[2rem] shadow-2xl z-30 flex flex-col items-center justify-center overflow-hidden border-2 border-black/10 cursor-pointer" style="background: \${p.color || '#FFB800'}; width: \${p.width || 96}px; height: \${p.height || 160}px;">
                            <div class="absolute top-0 inset-x-0 h-[15%] bg-slate-900"></div>
                            <div class="relative z-10 font-black text-slate-900 text-[10px] p-2 text-center uppercase">\${p.title || 'FILM 400'}</div>
                            <div class="absolute bottom-0 inset-x-0 h-[15%] bg-slate-900"></div>
                        </div>
                        <div class="absolute left-[70%] h-[80%] bg-[#1a1a1a] shadow-2xl transition-all duration-700 ease-in-out z-20 flex items-center px-4 overflow-hidden origin-left" style="width: \${isOpen ? (filmImages.length * 100 + 40) + 'px' : '0px'}; opacity: \${isOpen ? 1 : 0}; border-radius: 0 12px 12px 0;">
                            <div class="flex gap-4">
                                \${filmImages.map(img => \`<div class="bg-slate-800 rounded-sm overflow-hidden border border-white/10" style="width: 80px; height: 80px;"><img src="\${img}" class="w-full h-full object-cover"></div>\`).join('')}
                            </div>
                        </div>
                    </div>\`;
                    break;
                }
                case 'accordion':
                    content = \`<div class="flex items-center">
                        \${Array.from({length: 4}).map((_, i) => \`
                            <div class="h-full bg-white border border-slate-200 shadow-lg relative overflow-hidden transition-all duration-700 ease-in-out" 
                                 style="width: \${isOpen ? (p.width || 192)/4 + 'px' : '10px'}; height: \${p.height || 128}px; transform: skewY(\${i%2===0 ? '5deg' : '-5deg'}) translateX(\${i * (isOpen ? 0 : -8)}px); z-index: \${4-i};">
                                <img src="\${node.imgBg}" class="absolute inset-0 w-full h-full object-cover opacity-60" style="left: -\${i*100}%; width: \${p.width || 192}px;">
                                \${i===0 ? \`<div class="absolute inset-0 flex items-center justify-center p-2"><span class="text-[8px] font-black text-slate-800 rotate-90">\${p.title}</span></div>\` : ''}
                            </div>
                        \`).join('')}
                    </div>\`;
                    break;
                case 'wanted':
                    content = \`<div class="relative border-8 border-[#d2b48c] shadow-2xl bg-[#f5deb3] overflow-hidden" style="width: \${p.width || 192}px; height: \${p.height || 256}px;">
                        <div class="flex flex-col items-center p-4">
                            <h2 class="font-black text-slate-900 uppercase text-2xl tracking-tighter mb-1">Wanted</h2>
                            <div class="w-full aspect-square border-4 border-slate-900 mb-2 overflow-hidden">
                                <img src="\${node.imgBg}" class="w-full h-full object-cover transition-all duration-1000 \${isOpen ? 'grayscale-0 scale-100' : 'grayscale scale-110 blur-sm'}">
                            </div>
                            <p class="text-xl font-black text-slate-900 tracking-widest">\${p.title}</p>
                        </div>
                    </div>\`;
                    break;
                case 'suit':
                    content = \`<div class="relative flex flex-col items-center justify-end" style="width: \${p.width || 192}px; height: \${p.height || 224}px;">
                        <div class="absolute left-1/2 -translate-x-1/2 w-[40%] transition-all duration-700" style="height: \${isOpen ? '40%' : '10%'}; bottom: 65%; border-left: 4px solid #94a3b8; border-right: 4px solid #94a3b8; border-top: 4px solid #94a3b8; border-radius: 12px 12px 0 0;"></div>
                        <div class="absolute bg-white p-2 shadow-2xl transition-all duration-700 ease-out border border-slate-200 z-10 \${isOpen ? '-translate-y-[90%]' : '-translate-y-[10%] scale-95 opacity-0'}" style="width: \${(p.width||192)*0.8}px; transform-origin: bottom;">
                            <div class="w-full h-32 bg-slate-100 overflow-hidden"><img src="\${node.imgBg}" class="w-full h-full object-cover"></div>
                            <p class="mt-2 text-[10px] text-center font-bold text-slate-600">\${p.title}</p>
                        </div>
                        <div class="relative w-full h-[70%] rounded-3xl border-4 border-white shadow-2xl z-20" style="background: \${p.color || '#1971c2'};"></div>
                    </div>\`;
                    break;
                case 'record':
                    content = \`<div class="relative bg-white p-3 rounded-2xl shadow-2xl border-b-8 border-slate-200 flex items-center justify-between" style="width: \${p.width || 208}px; height: \${p.height || 176}px;">
                        <div class="absolute inset-0 rounded-2xl" style="background: \${p.color || '#2d3436'};"></div>
                        <div class="relative z-10 flex items-center w-full gap-2 px-1">
                            <div class="relative rounded-full border-[6px] border-[#1a1a1a] shadow-xl overflow-hidden flex items-center justify-center \${isOpen ? 'animate-spin-slow' : ''}" style="width: 100px; height: 100px;">
                                <div class="rounded-full overflow-hidden border-2 border-white/20 w-[40%] h-[40%]"><img src="\${node.imgBg}" class="w-full h-full object-cover"></div>
                            </div>
                            <div class="flex-1 bg-black/20 backdrop-blur-sm rounded-lg p-1 text-white text-[8px] font-black uppercase text-center truncate">\${isOpen ? 'Playing...' : p.title}</div>
                        </div>
                    </div>\`;
                    break;
                case 'news':
                    content = \`<div class="bg-[#f4f1ea] border border-slate-300 shadow-2xl transition-all duration-700 origin-top flex flex-col p-4 overflow-hidden relative \${isOpen ? 'rotate-x-0' : 'rotate-x-45'}" 
                                 style="width: \${isOpen ? (p.width||256) : (p.width||256)*0.6}px; height: \${isOpen ? (p.height||320) : (p.height||320)*0.4}px;">
                        <h3 class="font-black text-slate-800 uppercase leading-none border-b-2 border-slate-800 pb-2 mb-2">\${p.title}</h3>
                        <div class="flex-1 flex gap-2">
                           <div class="flex-1 space-y-2">
                             <div class="w-full h-2 bg-slate-300 rounded"></div>
                             <div class="w-[80%] h-2 bg-slate-300 rounded"></div>
                             \${isOpen ? \`<div class="w-full h-24 bg-slate-200 rounded overflow-hidden"><img src="\${node.imgBg}" class="w-full h-full object-cover"></div>\` : ''}
                           </div>
                        </div>
                    </div>\`;
                    break;
                default:
                    content = \`<div class="bg-white/80 p-2 rounded-xl border border-black/5 text-[10px] font-black uppercase tracking-widest">\${node.type} 组件</div>\`;
            }
            
            div.innerHTML = content;
            return div;
        }

        function updateView() {
            const left = document.getElementById('left-page');
            const right = document.getElementById('right-page');
            const dots = document.getElementById('dots');
            
            left.innerHTML = ''; right.innerHTML = '';
            dots.innerHTML = '';
            
            const p1 = bookData.pages[activeIdx];
            const p2 = bookData.pages[activeIdx + 1];

            if(p1) p1.nodes.forEach(n => left.appendChild(renderNode(n)));
            if(p2) p2.nodes.forEach(n => right.appendChild(renderNode(n)));

            document.getElementById('prev-btn').classList.toggle('disabled', activeIdx === 0);
            document.getElementById('next-btn').classList.toggle('disabled', activeIdx >= bookData.pages.length - 2);

            for (let i = 0; i < Math.ceil(bookData.pages.length / 2); i++) {
                const dot = document.createElement('div');
                dot.className = \`h-1.5 rounded-full transition-all duration-500 \${Math.floor(activeIdx / 2) === i ? 'bg-indigo-500 w-16' : 'bg-white/20 w-6'}\`;
                dots.appendChild(dot);
            }

            const scale = Math.min(window.innerWidth * 0.9 / (${LOGICAL_PAGE_WIDTH} * 2), window.innerHeight * 0.7 / ${LOGICAL_PAGE_HEIGHT});
            document.getElementById('spread').style.transform = \`scale(\${scale})\`;
        }

        document.getElementById('prev-btn').onclick = () => { if(activeIdx > 0) { activeIdx -= 2; updateView(); } };
        document.getElementById('next-btn').onclick = () => { if(activeIdx < bookData.pages.length - 2) { activeIdx += 2; updateView(); } };
        
        window.onresize = updateView;
        updateView();
    </script>
</body>
</html>`;

    const blob = new Blob([standaloneHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentScrapbook.title}_交互展示.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return (
          <div className="flex-1 overflow-y-auto p-12 bg-[#F8F9FA] text-slate-800">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-black mb-2 tracking-tight">欢迎回来, 创作者</h2>
                  <p className="text-slate-400 font-medium">今天想记录哪段精彩的记忆？</p>
                </div>
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100">
                  <Sparkles className="text-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-8 mb-16">
                <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-2xl cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveView('projects')}>
                  <BookText size={32} className="mb-6" />
                  <h3 className="text-xl font-bold mb-2">我的手账本</h3>
                  <p className="text-indigo-100 text-sm">{scrapbooks.length} 个项目正在进行中</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveView('templates')}>
                  <Layers size={32} className="mb-6 text-purple-500" />
                  <h3 className="text-xl font-bold mb-2">形态实验室</h3>
                  <p className="text-slate-400 text-sm">选择不同的装订与贴纸素材</p>
                </div>
                <div className="bg-slate-800 p-8 rounded-[2rem] text-white shadow-xl cursor-pointer hover:scale-105 transition-transform group" onClick={() => createNewScrapbook()}>
                  <Plus size={32} className="mb-6 group-hover:rotate-90 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">新建作品</h3>
                  <p className="text-slate-400 text-sm">从空白页开始您的设计</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="flex-1 overflow-y-auto p-12 bg-white text-slate-800">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black">手账书架</h2>
                <button onClick={() => createNewScrapbook()} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  <Plus size={18} /> 新建经典书
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                {scrapbooks.map(book => (
                  <div key={book.id} className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 flex flex-col group">
                    <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 shadow-md">
                      <img src={book.cover} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex-1 px-2">
                       <h3 className="font-black text-xl mb-1">{book.title}</h3>
                       <p className="text-[10px] text-slate-400 font-black uppercase">{book.style === 'spiral_accordion' ? '直角旋涡' : '经典书本'}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-6">
                      <button onClick={() => openEditor(book.id)} className="flex-1 py-3 bg-white text-slate-700 rounded-2xl text-xs font-bold border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all">编辑</button>
                      <button onClick={() => { setSelectedScrapbookId(book.id); setActiveView('preview'); }} className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-colors"><Eye size={18} /></button>
                      <button onClick={() => setScrapbooks(prev => prev.filter(s => s.id !== book.id))} className="p-3 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'editor':
        if (!currentScrapbook || !currentPage) return null;
        const selectedNode = currentPage.nodes.find(n => n.id === selectedNodeId) || null;
        return (
          <div className="flex-1 flex flex-col relative bg-slate-100">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveView('projects')} className="w-10 h-10 hover:bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-base font-bold text-slate-800">{currentScrapbook.title}</h1>
              </div>
              <div className="flex items-center gap-3">
                 <button onClick={() => { setIsPreviewExpanded(false); setActiveView('preview'); }} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
                   <Eye size={16} /> 物理预览
                 </button>
              </div>
            </header>
            <div className="flex-1 flex overflow-hidden">
              <Sidebar onAddNode={handleAddNode} userStickers={userStickers} />
              <div ref={editorContainerRef} className="flex-1 relative flex items-center justify-center p-8 overflow-hidden bg-slate-200">
                <div className={`relative bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-500 ${isFlipping ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} style={{ width: LOGICAL_PAGE_WIDTH, height: LOGICAL_PAGE_HEIGHT, transform: `scale(${editorScale})`, transformOrigin: 'center' }}>
                  <Canvas 
                    nodes={currentPage.nodes} 
                    connections={currentPage.connections} 
                    selectedNodeId={selectedNodeId} 
                    isConnecting={isConnecting !== null} 
                    onSelectNode={setSelectedNodeId} 
                    onUpdateNode={(id, data) => {
                      const newNodes = currentPage.nodes.map(n => n.id === id ? { ...n, ...data } : n);
                      const newPages = [...currentScrapbook.pages];
                      newPages[currentPageIndex] = { ...newPages[currentPageIndex], nodes: newNodes };
                      setScrapbooks(prev => prev.map(s => s.id === selectedScrapbookId ? { ...s, pages: newPages } : s));
                    }} 
                    onConnect={(targetId) => {
                      if (isConnecting !== null && isConnecting !== targetId) {
                        const newPages = [...currentScrapbook.pages];
                        newPages[currentPageIndex] = { 
                          ...newPages[currentPageIndex], 
                          connections: [...newPages[currentPageIndex].connections, { from: isConnecting, to: targetId }] 
                        };
                        setScrapbooks(prev => prev.map(s => s.id === selectedScrapbookId ? { ...s, pages: newPages } : s));
                        setIsConnecting(null);
                      }
                    }} 
                    onToggleOpen={(id) => {
                      const newNodes = currentPage.nodes.map(n => n.id === id ? { ...n, isOpen: !n.isOpen } : n);
                      const newPages = [...currentScrapbook.pages];
                      newPages[currentPageIndex] = { ...newPages[currentPageIndex], nodes: newNodes };
                      setScrapbooks(prev => prev.map(s => s.id === selectedScrapbookId ? { ...s, pages: newPages } : s));
                    }} 
                    onDeleteNode={(id) => {
                      const newNodes = currentPage.nodes.filter(n => n.id !== id);
                      const newPages = [...currentScrapbook.pages];
                      newPages[currentPageIndex] = { ...newPages[currentPageIndex], nodes: newNodes };
                      setScrapbooks(prev => prev.map(s => s.id === selectedScrapbookId ? { ...s, pages: newPages } : s));
                    }} 
                    onStartConnecting={(id) => setIsConnecting(id)} 
                    onAddNode={handleAddNode} 
                  />
                </div>
                <div className="absolute bottom-12 flex gap-4">
                  <button onClick={() => goToPage(currentPageIndex - 1)} disabled={currentPageIndex === 0} className="p-4 bg-white rounded-full shadow-lg disabled:opacity-20"><ChevronLeft /></button>
                  <button onClick={() => goToPage(currentPageIndex + 1)} disabled={currentPageIndex === currentScrapbook.pages.length - 1} className="p-4 bg-white rounded-full shadow-lg disabled:opacity-20"><ChevronRight /></button>
                </div>
              </div>
              <PropertyPanel 
                selectedNode={selectedNode}
                onUpdateProps={(p) => {
                  if (selectedNodeId === null) return;
                  const newNodes = currentPage.nodes.map(n => n.id === selectedNodeId ? { ...n, props: { ...n.props, ...p } } : n);
                  const newPages = [...currentScrapbook.pages];
                  newPages[currentPageIndex] = { ...newPages[currentPageIndex], nodes: newNodes };
                  setScrapbooks(prev => prev.map(s => s.id === selectedScrapbookId ? { ...s, pages: newPages } : s));
                }}
                onUpdateNode={(data) => {
                  if (selectedNodeId === null) return;
                  const newNodes = currentPage.nodes.map(n => n.id === selectedNodeId ? { ...n, ...data } : n);
                  const newPages = [...currentScrapbook.pages];
                  newPages[currentPageIndex] = { ...newPages[currentPageIndex], nodes: newNodes };
                  setScrapbooks(prev => prev.map(s => s.id === selectedScrapbookId ? { ...s, pages: newPages } : s));
                }}
                onDelete={() => {
                  if (selectedNodeId === null) return;
                  const newNodes = currentPage.nodes.filter(n => n.id !== selectedNodeId);
                  const newPages = [...currentScrapbook.pages];
                  newPages[currentPageIndex] = { ...newPages[currentPageIndex], nodes: newNodes };
                  setScrapbooks(prev => prev.map(s => s.id === selectedScrapbookId ? { ...s, pages: newPages } : s));
                  setSelectedNodeId(null);
                }}
                onStartConnecting={() => setIsConnecting(selectedNodeId)}
              />
            </div>
          </div>
        );

      case 'preview':
        if (!currentScrapbook) return null;
        return (
          <div className="fixed inset-0 bg-slate-950 z-[1000] flex flex-col items-center justify-center p-8 overflow-hidden text-white">
            <button onClick={() => setActiveView('editor')} className="absolute top-8 left-8 p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-2 border border-white/5 z-[2000] transition-all">
              <ArrowLeft size={20} /> 退出预览
            </button>
            <div className="flex flex-col items-center gap-6 w-full max-w-7xl h-full justify-center">
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-black tracking-tight">{currentScrapbook.title}</h2>
              </div>
              <div className="relative w-full flex-1 max-h-[75vh] flex items-center justify-center overflow-visible">
                <BookPreview ref={previewSpreadRef} pages={currentScrapbook.pages} onToggleOpen={(pageIdx, nodeId) => {
                  const newPages = [...currentScrapbook.pages];
                  newPages[pageIdx].nodes = newPages[pageIdx].nodes.map(n => n.id === nodeId ? { ...n, isOpen: !n.isOpen } : n);
                  setScrapbooks(prev => prev.map(s => s.id === currentScrapbook.id ? { ...s, pages: newPages } : s));
                }} />
              </div>
              <div className="flex items-center gap-4 pb-4">
                 <button onClick={handleDownloadStandaloneHTML} className="p-5 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/5 shadow-xl group relative transition-all">
                    <Download size={24} />
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">下载独立HTML</span>
                 </button>
                 <button onClick={handleExportImage} disabled={isExporting} className="p-5 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/5 shadow-xl group relative transition-all">
                    {isExporting ? <RotateCcw className="animate-spin" size={24} /> : <Printer size={24} />}
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">导出为PNG图片</span>
                 </button>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const createNewScrapbook = () => {
    const id = Date.now();
    const newBook: Scrapbook = { id, title: '我的新回忆录', categoryId: 'life', style: 'classic', cover: `https://picsum.photos/seed/${id}/600/400`, pages: Array.from({ length: 4 }).map((_, i) => ({ id: id + i, nodes: [], connections: [] })), lastModified: Date.now() };
    setScrapbooks([newBook, ...scrapbooks]);
    setSelectedScrapbookId(id);
    setCurrentPageIndex(0);
    setActiveView('editor');
  };

  return <div className="flex h-screen bg-slate-900 overflow-hidden font-sans select-none">{renderView()}</div>;
};

const BookPreview = React.forwardRef<HTMLDivElement, { pages: ScrapbookPage[], onToggleOpen: (p: number, id: number) => void }>(({ pages, onToggleOpen }, ref) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const winW = window.innerWidth * 0.9; const winH = window.innerHeight * 0.7;
        const scaleW = winW / (LOGICAL_PAGE_WIDTH * 2); const scaleH = winH / LOGICAL_PAGE_HEIGHT;
        setScale(Math.min(scaleW, scaleH));
      }
    };
    updateScale(); window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="flex flex-col items-center gap-10 w-full h-full justify-center relative" ref={containerRef}>
      <button 
        onClick={() => { if(activeIdx > 0) setActiveIdx(activeIdx - 2); }} 
        className="absolute left-4 top-1/2 -translate-y-1/2 p-6 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all disabled:opacity-5 backdrop-blur-xl border border-white/5 z-[100] shadow-2xl" 
        disabled={activeIdx === 0}
      >
        <ChevronLeft size={48} strokeWidth={2.5} />
      </button>
      <button 
        onClick={() => { if(activeIdx < pages.length - 2) setActiveIdx(activeIdx + 2); }} 
        className="absolute right-4 top-1/2 -translate-y-1/2 p-6 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all disabled:opacity-5 backdrop-blur-xl border border-white/5 z-[100] shadow-2xl" 
        disabled={activeIdx >= pages.length - 2}
      >
        <ChevronRight size={48} strokeWidth={2.5} />
      </button>

      <div 
        ref={ref} 
        className="relative shadow-[0_50px_120px_rgba(0,0,0,0.8)] bg-slate-800 rounded-[2.5rem] overflow-hidden flex" 
        style={{ width: LOGICAL_PAGE_WIDTH * 2, height: LOGICAL_PAGE_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'center center', flexShrink: 0 }}
      >
        <div className="flex-1 bg-[#FCFBF4] relative overflow-hidden rounded-l-[1.5rem] shadow-[inset_-30px_0_60px_rgba(0,0,0,0.06)] flex items-center justify-center">
           <Canvas nodes={pages[activeIdx]?.nodes || []} connections={pages[activeIdx]?.connections || []} selectedNodeId={null} isConnecting={false} readOnly={true} onSelectNode={() => {}} onUpdateNode={() => {}} onConnect={() => {}} onToggleOpen={(id) => onToggleOpen(activeIdx, id)} onDeleteNode={() => {}} onStartConnecting={() => {}} onAddNode={() => {}} />
        </div>
        <div className="w-[2px] bg-black/15 z-10 h-full"></div>
        <div className="flex-1 bg-white relative overflow-hidden rounded-r-[1.5rem] shadow-[inset_30px_0_60px_rgba(0,0,0,0.04)] flex items-center justify-center">
           <Canvas nodes={pages[activeIdx + 1]?.nodes || []} connections={pages[activeIdx + 1]?.connections || []} selectedNodeId={null} isConnecting={false} readOnly={true} onSelectNode={() => {}} onUpdateNode={() => {}} onConnect={() => {}} onToggleOpen={(id) => onToggleOpen(activeIdx + 1, id)} onDeleteNode={() => {}} onStartConnecting={() => {}} onAddNode={() => {}} />
        </div>
      </div>

      <div className="flex gap-3 z-50 py-2">
        {Array.from({ length: Math.ceil(pages.length / 2) }).map((_, i) => (
          <button key={i} onClick={() => setActiveIdx(i * 2)} className={`h-1.5 rounded-full transition-all duration-500 ${Math.floor(activeIdx / 2) === i ? 'bg-indigo-500 w-16 shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'bg-white/10 w-6'}`} />
        ))}
      </div>
    </div>
  );
});

export default App;
