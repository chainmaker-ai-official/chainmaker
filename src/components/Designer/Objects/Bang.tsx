import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const Bang: React.FC<any> = ({ 
  id, label, type = 'default', isPaletteItem = false, onDragStart, onDragEnd, x, y,
  isDragging = false, isNew = false, isDeleting = false, onDelete, onConnectionStart,
  onConnectionEnd, isConnected = false, onBang = null, isSelected = false, onClick, onContextMenu,
  inputCount = 0, outputCount = 0
}) => {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    if (isOn) {
      const timer = setTimeout(() => setIsOn(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOn]);

  const primaryColor = '#56B6C2';
  const secondaryColor = '#0a1525';
  
  const adjustedX = x !== undefined ? x + 20 : x;
  const adjustedY = y !== undefined ? y + 5 : y;
  
  const blockStyle: React.CSSProperties = {
    width: '60px',
    height: '60px',
    position: 'absolute',
    left: adjustedX !== undefined ? `${adjustedX}px` : 'auto',
    top: adjustedY !== undefined ? `${adjustedY}px` : 'auto',
    border: isSelected ? `2px solid #ffcc00` : `1px solid #1e4976`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    backgroundColor: 'transparent',
    zIndex: isSelected ? 10 : 1
  };

  const circleStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: isOn ? primaryColor : secondaryColor,
    border: `2px solid #1e4976`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease-in-out'
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    if (onDragStart) onDragStart(id, e);
  };

  const handleBangClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isOn;
    setIsOn(newState);
    if (onBang) onBang(id, newState);
  };

  return (
    <div
      className={`draggable-block ${isPaletteItem ? 'palette-block' : 'workspace-block'} ${isDragging ? 'is-dragging' : ''} ${isDeleting ? 'block-fade-out' : ''}`}
      style={blockStyle}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onContextMenu={onContextMenu}
      data-node-id={id}
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
                className="w-2.5 h-[2px]" 
                style={{ backgroundColor: primaryColor }}
                data-input-port="true"
                data-port-index={i}
              />
            ))}
          </div>
        </div>
      )}

      <div style={circleStyle} onClick={handleBangClick}>
      </div>
      
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
    </div>
  );
};

export default Bang;
