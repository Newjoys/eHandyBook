
import React, { useCallback, useRef } from 'react';
import { NodeData, Connection, NodeType } from '../types';
import { InteractiveNode } from './InteractiveNode';
import { LOGICAL_PAGE_WIDTH, LOGICAL_PAGE_HEIGHT } from '../App';

interface CanvasProps {
  nodes: NodeData[];
  connections: Connection[];
  selectedNodeId: number | null;
  isConnecting: boolean;
  readOnly?: boolean;
  onSelectNode: (id: number | null) => void;
  onUpdateNode: (id: number, data: Partial<NodeData>) => void;
  onConnect: (targetId: number) => void;
  onToggleOpen: (id: number) => void;
  onDeleteNode: (id: number) => void;
  onStartConnecting: (id: number) => void;
  onAddNode: (type: NodeType, x: number, y: number, customProps?: Record<string, any>) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  connections,
  selectedNodeId,
  isConnecting,
  readOnly = false,
  onSelectNode,
  onUpdateNode,
  onConnect,
  onToggleOpen,
  onDeleteNode,
  onStartConnecting,
  onAddNode
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    const type = e.dataTransfer.getData('nodeType') as NodeType;
    const customPropsRaw = e.dataTransfer.getData('customProps');
    let customProps = undefined;
    
    if (customPropsRaw) {
      try {
        customProps = JSON.parse(customPropsRaw);
      } catch (err) {
        console.error("Failed to parse custom props", err);
      }
    }

    if (!type || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    // Calculate scale ratio between logical units and visual units
    const scaleX = LOGICAL_PAGE_WIDTH / rect.width;
    const scaleY = LOGICAL_PAGE_HEIGHT / rect.height;

    // Convert mouse coordinates to logical coordinates
    const x = (e.clientX - rect.left) * scaleX - 40;
    const y = (e.clientY - rect.top) * scaleY - 40;

    onAddNode(type, x, y, customProps);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    if (e.target === canvasRef.current) {
      onSelectNode(null);
    }
  };

  return (
    <div 
      ref={canvasRef}
      className={`relative bg-[#FCFBF4] overflow-visible ${readOnly ? 'cursor-default' : 'cursor-crosshair'}`}
      onDragOver={(e) => !readOnly && e.preventDefault()}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      style={{
        backgroundImage: 'radial-gradient(circle, #E5E4DE 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.02)',
        width: LOGICAL_PAGE_WIDTH,
        height: LOGICAL_PAGE_HEIGHT
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] z-0"></div>

      <svg className="absolute inset-0 pointer-events-none w-full h-full z-10">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orientation="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
          </marker>
        </defs>
        {connections.map((conn, idx) => {
          const from = nodes.find(n => n.id === conn.from);
          const to = nodes.find(n => n.id === conn.to);
          if (!from || !to) return null;

          const x1 = from.x + 40;
          const y1 = from.y + 40;
          const x2 = to.x + 40;
          const y2 = to.y + 40;

          return (
            <path
              key={`${conn.from}-${conn.to}-${idx}`}
              d={`M ${x1} ${y1} C ${(x1+x2)/2} ${y1}, ${(x1+x2)/2} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="4,4"
              markerEnd="url(#arrowhead)"
            />
          );
        })}
      </svg>

      <div className="relative z-30 w-full h-full">
        {nodes.map(node => (
          <InteractiveNode
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isConnecting={isConnecting}
            readOnly={readOnly}
            onSelect={() => !readOnly && onSelectNode(node.id)}
            onMove={(x, y) => !readOnly && onUpdateNode(node.id, { x, y })}
            onToggleOpen={() => onToggleOpen(node.id)}
            onConnect={() => !readOnly && onConnect(node.id)}
            onDelete={() => !readOnly && onDeleteNode(node.id)}
            onStartConnecting={() => !readOnly && onStartConnecting(node.id)}
          />
        ))}
      </div>

      {isConnecting && !readOnly && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-6 py-2 rounded-full shadow-2xl text-[24px] font-bold animate-pulse z-[100] whitespace-nowrap">
          ✨ 点击目标卡片以建立联系 ✨
        </div>
      )}
    </div>
  );
};
