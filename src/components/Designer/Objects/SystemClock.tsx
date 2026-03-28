import React, { useState, useEffect, useRef } from 'react';

const SystemClock: React.FC<any> = ({ 
  id, label, type = 'default', isPaletteItem = false, onDragStart, onDragEnd, x, y,
  isDragging = false, isNew = false, isDeleting = false, onDelete, onConnectionStart,
  onConnectionEnd, isConnected = false, onTick = null, isSelected = false, onClick, onContextMenu,
  inputCount = 0, outputCount = 0
}) => {
  const [time, setTime] = useState(0);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isConnected) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          const next = prev + 1;
          if (onTick) onTick(next);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isConnected, onTick]);
  
  useEffect(() => {
    if (!isConnected) setTime(0);
  }, [isConnected]);

  const rectangleColor = type === 'blockchain' ? '#64ffda' : '#00ff00';
  
  const blockStyle: React.CSSProperties = {
    background: type === 'blockchain' ? '#0a1929' : '#0a0a0a',
    border: isSelected ? `2px solid #ffcc00` : `1px solid ${type === 'blockchain' ? '#1e4976' : '#333333'}`,
    color: type === 'blockchain' ? '#64ffda' : '#00ff00',
    cursor: isPaletteItem ? 'grab' : 'move',
    padding: '12px 20px 10px 20px',
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
      {/* Input Area (Top) */}
      <div 
        className="absolute top-0 left-0 w-full h-1/3 cursor-crosshair z-20"
        data-input-area="true"
        data-node-id={id}
      >
        <div className="flex justify-around items-start w-full h-[2px] absolute -top-[1px] left-0 px-2 box-border">
          {Array.from({ length: Math.max(1, inputCount) }).map((_, i) => (
            <div 
              key={`input-${i}`} 
              className="w-2.5 h-[2px]" 
              style={{ backgroundColor: rectangleColor }}
              data-input-port="true"
              data-port-index={i}
            />
          ))}
        </div>
      </div>

      {/* Output Area (Bottom) */}
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
      
      {label} {isConnected && <span className="ml-2 opacity-70">({time}s)</span>}
    </div>
  );
};

export default SystemClock;
