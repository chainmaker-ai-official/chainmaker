import React from 'react';
import { BarChart2, X } from 'lucide-react';

const DataView: React.FC<any> = ({ 
  id, label, type = 'data', isPaletteItem = false, onDragStart, onDragEnd, x, y,
  isDragging, isNew, isDeleting, onDelete, onConnectionStart, onConnectionEnd,
  isConnected = false, data = null, isSelected = false, onClick, onContextMenu,
  inputCount = 0, outputCount = 0
}) => {
  const displayData = data || {
    source: 'Live Order Book',
    timestamp: new Date().toISOString(),
    status: 'No data connected',
    message: 'Connect to a data source using draggable lines'
  };

  const blockStyle: React.CSSProperties = {
    background: '#0a1929',
    border: isSelected ? `2px solid #ffcc00` : `2px solid #1e4976`,
    cursor: isPaletteItem ? 'grab' : 'move',
    color: '#64ffda',
    padding: '0',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontWeight: '500',
    width: isPaletteItem ? '100%' : '250px',
    height: isPaletteItem ? '100%' : 'auto',
    minHeight: isPaletteItem ? '0' : '300px',
    display: 'flex',
    flexDirection: 'column',
    position: isPaletteItem ? 'relative' : 'absolute',
    left: x !== undefined ? `${x}px` : 'auto',
    top: y !== undefined ? `${y}px` : 'auto',
    overflow: 'hidden',
    zIndex: isSelected ? 10 : 1
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    if (onDragStart) onDragStart(id, e);
  };

  return (
    <div
      id={id}
      data-node-id={id}
      className={`draggable-block ${isPaletteItem ? 'palette-block' : 'workspace-block'} ${isDragging ? 'is-dragging' : ''} ${isNew ? 'block-fade-in' : ''} ${isDeleting ? 'block-fade-out' : ''}`}
      style={blockStyle}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {/* Input Area (Top) */}
      {!isPaletteItem && (
        <div 
          className="absolute top-0 left-0 w-full h-1/3 cursor-crosshair z-20"
          data-input-area="true"
          data-node-id={id}
        >
          <div className="flex justify-around items-start w-full h-[2px] absolute -top-[1px] left-0 px-2 box-border">
            {Array.from({ length: Math.max(1, inputCount) }).map((_, i) => (
              <div 
                key={`input-${i}`} 
                className="w-2.5 h-[2px] bg-current" 
                data-input-port="true"
                data-port-index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* Output Area (Bottom) */}
      {!isPaletteItem && (
        <div 
          className="absolute bottom-0 left-0 w-full h-1/3 cursor-crosshair z-20"
          data-output-area="true"
          data-node-id={id}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onConnectionStart?.(id, 'output', e);
          }}
        >
          <div className="flex justify-around items-end w-full h-[2px] absolute -bottom-[1px] left-0 px-2 box-border">
            {Array.from({ length: Math.max(1, outputCount) }).map((_, i) => (
              <div 
                key={`output-${i}`} 
                className="w-2.5 h-[2px] bg-[#ff00ff]" 
                data-output-port="true"
                data-port-index={i}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 bg-gradient-to-br from-[#0a1929] to-[#0d2540]">
        <div className="bg-[#1e49764d] border-b border-[#1e4976] p-3 rounded-t-lg">
          <div className="flex items-center justify-between text-[#64ffda] font-bold text-base">
            <span className="mr-2"><BarChart2 size={18} /></span>
            <span className="flex-1 text-left">{label || 'Data View'}</span>
          </div>
          <div className="text-[#88aacc] text-xs mt-1 text-left opacity-80">JSON Data Viewer</div>
        </div>
        
        <div className="flex-1 p-4 bg-[#0a192999] flex flex-col">
          <div className="text-[#88aacc] text-xs font-medium mb-2.5 text-left uppercase tracking-wider">Data Output</div>
          <div className="flex-1 bg-[#1e497633] border border-[#1e4976] rounded-lg p-3 overflow-auto">
            <pre className="text-white text-[11px] font-mono m-0 whitespace-pre-wrap break-words leading-relaxed">
              {JSON.stringify(displayData, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className="p-2.5 px-4 bg-[#1e49764d] border-t border-[#1e4976] rounded-b-lg">
          <div className="text-[#88aacc] text-[11px] text-center opacity-70">
            {displayData.status === 'No data connected' ? 'Waiting for data...' : `Data from: ${displayData.source || 'Unknown'}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataView;
