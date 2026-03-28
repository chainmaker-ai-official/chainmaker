import React, { useState, useEffect, useRef } from 'react';

const ConditionSwitch: React.FC<any> = ({ 
  id, label, type = 'default', isPaletteItem = false, onDragStart, onDragEnd, x, y,
  isDragging = false, isNew = false, isDeleting = false, onDelete, onConnectionStart,
  onLabelChange, isSelected = false, onClick, onContextMenu,
  inputCount = 0, outputCount = 0
}) => {
  const [leftValue, setLeftValue] = useState('');
  const [operator, setOperator] = useState('>');
  const [rightValue, setRightValue] = useState('');

  useEffect(() => {
    if (label && label.trim()) {
      const match = label.match(/(\w+)\s*(==|!=|>=|<=|>|<)\s*(\w+)/i);
      if (match) {
        setLeftValue(match[1]);
        setOperator(match[2]);
        setRightValue(match[3]);
      } else {
        setLeftValue(label);
      }
    }
  }, [label]);

  const primaryColor = '#56B6C2';
  const rectangleColor = '#00ff00';

  const blockStyle: React.CSSProperties = {
    minWidth: '140px',
    minHeight: '40px',
    position: 'absolute',
    left: x !== undefined ? `${x}px` : 'auto',
    top: y !== undefined ? `${y}px` : 'auto',
    background: '#0a1525',
    border: isSelected ? `2px solid #ffcc00` : `1px solid ${primaryColor}`,
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    gap: '6px',
    userSelect: 'none',
    boxSizing: 'border-box',
    cursor: isPaletteItem ? 'grab' : 'move',
    zIndex: isSelected ? 10 : 1
  };

  const cycleOperator = () => {
    const ops = ['>', '<', '>=', '<=', '==', '!='];
    const nextOp = ops[(ops.indexOf(operator) + 1) % ops.length];
    setOperator(nextOp);
    if (onLabelChange) onLabelChange(id, `${leftValue}${nextOp}${rightValue}`);
  };

  return (
    <div
      className={`draggable-block ${isPaletteItem ? 'palette-block' : 'workspace-block'} ${isDragging ? 'is-dragging' : ''} ${isNew ? 'block-fade-in' : ''} ${isDeleting ? 'block-fade-out' : ''}`}
      style={blockStyle}
      draggable={true}
      onDragStart={(e) => { e.stopPropagation(); onDragStart?.(id, e); }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onContextMenu={onContextMenu}
      data-node-id={id}
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

      <input
        type="text"
        className="bg-[#1a2a3a] border border-[#3a4a5a] rounded text-[#ABB2BF] font-mono text-xs text-center w-12 outline-none p-0.5"
        value={leftValue}
        placeholder="val"
        onChange={(e) => setLeftValue(e.target.value)}
        onBlur={() => onLabelChange?.(id, `${leftValue}${operator}${rightValue}`)}
        onClick={(e) => e.stopPropagation()}
      />

      <span className="text-[#56B6C2] font-mono text-sm font-bold cursor-pointer min-w-[24px] text-center" onClick={(e) => { e.stopPropagation(); cycleOperator(); }}>
        {operator}
      </span>

      <input
        type="text"
        className="bg-[#1a2a3a] border border-[#3a4a5a] rounded text-[#ABB2BF] font-mono text-xs text-center w-12 outline-none p-0.5"
        value={rightValue}
        placeholder="val"
        onChange={(e) => setRightValue(e.target.value)}
        onBlur={() => onLabelChange?.(id, `${leftValue}${operator}${rightValue}`)}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ConditionSwitch;
