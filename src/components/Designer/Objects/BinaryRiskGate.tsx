import React from 'react';

const BinaryRiskGate: React.FC<any> = ({ 
  id, label, type = 'default', isPaletteItem = false, onDragStart, onDragEnd, x, y,
  isDragging = false, isNew = false, isDeleting = false, onDelete, onConnectionStart,
  onConnectionEnd, isConnected = false, isEditable = false, onLabelChange,
  isSelected = false, onClick, onContextMenu,
  inputCount = 0, outputCount = 0
}) => {
  const rectangleColor = '#ABB2BF';
  
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
        <span className="text-[10px] opacity-70 uppercase">Risk Gate</span>
        <span className="text-xs font-bold">{label || 'Risk Check'}</span>
        <div className="mt-2 flex gap-3 items-center">
          <div className="flex flex-col items-center gap-1">
            <div className="w-4 h-4 border border-green-500 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.6)]" />
            </div>
            <span className="text-[7px] text-green-500 font-bold">PASS</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-20">
            <div className="w-4 h-4 border border-red-500 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            </div>
            <span className="text-[7px] text-red-500 font-bold">FAIL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryRiskGate;
