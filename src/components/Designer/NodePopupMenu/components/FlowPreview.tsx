import React from 'react';
import { FlowTemplate } from '../../utils/templates';

interface FlowPreviewProps {
  template: FlowTemplate;
  side: 'left' | 'right';
  isSubMenuOpen?: boolean;
}

const FlowPreview: React.FC<FlowPreviewProps> = ({ template, side, isSubMenuOpen = false }) => {
  const sideStyle = side === 'right' 
    ? (isSubMenuOpen ? "left-[400px] border-l" : "left-full border-l")
    : (isSubMenuOpen ? "right-[400px] border-r" : "right-full border-r");

  // Calculate bounds for scaling
  const minX = Math.min(...template.nodes.map(n => n.position.x));
  const maxX = Math.max(...template.nodes.map(n => n.position.x));
  const minY = Math.min(...template.nodes.map(n => n.position.y));
  const maxY = Math.max(...template.nodes.map(n => n.position.y));

  const width = maxX - minX + 120; // Add some padding for node width
  const height = maxY - minY + 60; // Add some padding for node height
  
  const scale = Math.min(220 / width, 180 / height, 1);
  const offsetX = -minX * scale + 20;
  const offsetY = -minY * scale + 20;

  return (
    <div 
      className={`absolute ${sideStyle} top-0 w-[260px] bg-[#000C1D] border-[#56B6C2] flex flex-col shadow-[4px_0_12px_rgba(0,0,0,0.6)] z-20 border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}
    >
      <div className="px-3 py-2 border-b border-[#56B6C2] bg-[#0a1525]">
        <div className="text-[#C678DD] text-[0.7rem] font-bold uppercase tracking-[1px] font-mono">Flow Preview</div>
      </div>
      
      <div className="p-3 bg-[#000C1D] flex flex-col gap-3">
        <div className="text-[#ABB2BF] text-[0.75rem] leading-relaxed italic">
          {template.description}
        </div>
        
        <div className="relative h-[180px] w-full bg-[#050b14] border border-[#1a2840] rounded overflow-hidden">
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" fill="#56B6C2" />
              </marker>
            </defs>
            
            {/* Connections */}
            {template.connections.map((conn, i) => {
              const source = template.nodes[conn.sourceIndex];
              const target = template.nodes[conn.targetIndex];
              const x1 = source.position.x * scale + offsetX + 80 * scale;
              const y1 = source.position.y * scale + offsetY + 20 * scale;
              const x2 = target.position.x * scale + offsetX;
              const y2 = target.position.y * scale + offsetY + 20 * scale;
              
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} C ${x1 + 40 * scale} ${y1}, ${x2 - 40 * scale} ${y2}, ${x2} ${y2}`}
                  stroke="#56B6C2"
                  strokeWidth="1.5"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  className="animate-pulse"
                />
              );
            })}
            
            {/* Nodes */}
            {template.nodes.map((node, i) => (
              <g key={i} transform={`translate(${node.position.x * scale + offsetX}, ${node.position.y * scale + offsetY})`}>
                <rect 
                  width={80 * scale} 
                  height={40 * scale} 
                  rx={4 * scale} 
                  fill={node.typeId === 'bang' ? '#ff00ff22' : '#61AFEF22'} 
                  stroke={node.typeId === 'bang' ? '#ff00ff' : '#61AFEF'} 
                  strokeWidth="1"
                />
                <text 
                  x={40 * scale} 
                  y={24 * scale} 
                  textAnchor="middle" 
                  fill="#ABB2BF" 
                  fontSize={10 * scale} 
                  fontFamily="monospace"
                >
                  {node.label || node.typeId}
                </text>
              </g>
            ))}
          </svg>
          
          {/* Animated Signal */}
          <div className="absolute top-2 left-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff00ff] animate-ping" />
            <span className="text-[0.6rem] text-[#ff00ff] font-mono uppercase">Signal Flow</span>
          </div>
        </div>
        
        <div className="text-[0.65rem] text-[#56B6C2] font-mono flex items-center gap-2">
          <span className="w-1 h-1 bg-[#56B6C2] rounded-full" />
          {template.nodes.length} Nodes
          <span className="w-1 h-1 bg-[#56B6C2] rounded-full" />
          {template.connections.length} Connections
        </div>
      </div>
    </div>
  );
};

export default FlowPreview;
