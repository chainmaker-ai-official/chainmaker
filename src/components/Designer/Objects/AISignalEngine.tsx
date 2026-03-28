import React from 'react';

const AISignalEngine: React.FC<any> = ({ 
  id, label, type = 'default', isPaletteItem = false, onDragStart, onDragEnd, x, y,
  isDragging = false, isNew = false, isDeleting = false, onDelete, onConnectionStart,
  onConnectionEnd, isConnected = false, isEditable = false, onLabelChange,
  isSelected = false, onClick, onContextMenu,
  inputCount = 0, outputCount = 0
}) => {
  const rectangleColor = '#D19A66';
  
  const blockStyle: React.CSSProperties = {
    background: '#0a1525',
    border: isSelected ? `2px solid #ffcc00` : `1px solid ${rectangleColor}`,
    color: rectangleColor,
    cursor: isPaletteItem ? 'grab' : 'move',
    padding: '8px 12px 6px 12px',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontWeight: '500',
    textAlign: 'center',
    minWidth: '120px',
    userSelect: 'none',
    position: 'absolute',
    left: x !== undefined ? `${x}px` : 'auto',
    top: y !== undefined ? `${y}px` : 'auto',
    zIndex: isSelected ? 10 : 1
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    if (onDragStart) onDragStart(id, e);
  };

  return (
    <div
      className={`draggable-block ${isPaletteItem ? 'palette-block' : 'workspace-block'} ${isDragging ? 'is-dragging' : ''} ${isNew ? 'block-fade-in' : ''} ${isDeleting ? 'block-fade-out' : ''}`}
      style={blockStyle}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onContextMenu={onContextMenu}
      data-block-id={id}
    >
      <div className="absolute top-0 left-0 w-full h-1/3 cursor-crosshair z-20" data-input-area="true" data-node-id={id}>
        <div className="flex justify-around items-start w-full h-[2px] absolute -top-[1px] left-0 px-2 box-border">
          {Array.from({ length: Math.max(1, inputCount) }).map((_, i) => (
            <div key={`input-${i}`} className="w-2.5 h-[2px]" style={{ backgroundColor: rectangleColor }} data-input-port="true" data-port-index={i} />
          ))}
        </div>
      </div>

      <div 
        className="absolute bottom-0 left-0 w-full h-1/3 cursor-crosshair z-20" 
        data-output-area="true" 
        data-node-id={id}
        onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onConnectionStart?.(id, 'output', e); }}
      >
        <div className="flex justify-around items-end w-full h-[2px] absolute -bottom-[1px] left-0 px-2 box-border">
          {Array.from({ length: Math.max(1, outputCount) }).map((_, i) => (
            <div key={`output-${i}`} className="w-2.5 h-[2px] bg-[#ff00ff]" data-output-port="true" data-port-index={i} />
          ))}
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-[10px] opacity-70 uppercase">AI Engine</span>
        <span className="text-xs font-bold">{label || 'Signal Engine'}</span>
        <div className="mt-2 flex justify-center gap-1.5">
          <div className="flex flex-col gap-1">
            <div className="w-1 h-1 rounded-full bg-[#D19A66] opacity-40" />
            <div className="w-1 h-1 rounded-full bg-[#D19A66]" />
            <div className="w-1 h-1 rounded-full bg-[#D19A66] opacity-40" />
          </div>
          <div className="flex flex-col gap-1 justify-center">
            <div className="w-1 h-1 rounded-full bg-[#D19A66] animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-[#D19A66] animate-pulse delay-75" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="w-1 h-1 rounded-full bg-[#D19A66] opacity-40" />
            <div className="w-1 h-1 rounded-full bg-[#D19A66]" />
            <div className="w-1 h-1 rounded-full bg-[#D19A66] opacity-40" />
          </div>
        </div>
        <div className="mt-1 text-[8px] font-mono text-[#D19A66] opacity-80">
          CONFIDENCE: 94%
        </div>
      </div>
    </div>
  );
};

export default AISignalEngine;
