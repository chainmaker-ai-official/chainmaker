import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DraggableNodeProps {
  id: string;
  label: string;
  type?: string;
  isPaletteItem?: boolean;
  onDragStart?: (id: string, e: any) => void;
  onDragEnd?: () => void;
  x?: number;
  y?: number;
  isDragging?: boolean;
  isNew?: boolean;
  isDeleting?: boolean;
  onDelete?: (id: string) => void;
  onConnectionStart?: (id: string, portType: string, e: any) => void;
  onConnectionEnd?: (id: string, portType: string, e: any) => void;
  isConnected?: boolean;
  isEditable?: boolean;
  onLabelChange?: (id: string, label: string) => void;
  onClick?: (e: any) => void;
  onContextMenu?: (e: any) => void;
  isSelected?: boolean;
  inputCount?: number;
  outputCount?: number;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({ 
  id, label, type = 'default', isPaletteItem = false,
  onDragStart, onDragEnd, x, y, isDragging = false,
  isNew = false, isDeleting = false, onDelete,
  onConnectionStart, onConnectionEnd, isConnected = false,
  isEditable = false, onLabelChange, onClick, onContextMenu, isSelected = false,
  inputCount = 0, outputCount = 0
}) => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(label || '');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew && isEditable && !isPaletteItem) {
      setIsEditing(true);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [isNew, isEditable, isPaletteItem]);

  const rectangleColor = type === 'blockchain' ? '#64ffda' : '#00ff00';
  
  const calculateNodeWidth = () => {
    const text = isEditing ? editValue : (label || '\u00A0');
    return Math.max(40, 40 + (text.length * 8));
  };

  const nodeStyle: React.CSSProperties = {
    background: type === 'blockchain' ? '#0a1929' : '#0a0a0a',
    border: isSelected ? `2px solid ${type === 'blockchain' ? '#ffcc00' : '#ff0000'}` : `1px solid ${type === 'blockchain' ? '#1e4976' : '#333333'}`,
    color: type === 'blockchain' ? '#64ffda' : '#00ff00',
    cursor: isPaletteItem ? 'grab' : 'move',
    padding: '8px 12px 6px 12px',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontWeight: '500',
    textAlign: 'center',
    width: `${calculateNodeWidth()}px`,
    minWidth: '40px',
    minHeight: '30px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
    position: 'absolute',
    left: x !== undefined ? `${x}px` : 'auto',
    top: y !== undefined ? `${y}px` : 'auto',
    boxSizing: 'border-box',
    transition: 'width 0.1s ease-out, border 0.2s ease-out, box-shadow 0.2s ease-out',
    zIndex: isSelected ? 10 : 1
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    if (onDragStart) onDragStart(id, e);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isEditable && !isPaletteItem) {
      e.stopPropagation();
      setIsEditing(true);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    if (onLabelChange) onLabelChange(id, editValue.trim());
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleInputBlur();
    else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(label || '');
    }
    e.stopPropagation();
  };

  const handleInputMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`draggable-node ${isPaletteItem ? 'palette-node' : 'workspace-node'} ${isDragging ? 'is-dragging' : ''} ${isNew ? 'node-fade-in' : ''} ${isDeleting ? 'node-fade-out' : ''}`}
      style={nodeStyle}
      draggable={true}
      onDragStart={handleDragStart}
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
              className="w-2.5 h-[2px] bg-current" 
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
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="bg-transparent border-none outline-none text-inherit font-[inherit] text-center w-full min-w-[30px] min-h-[18px] leading-tight"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          onMouseDown={handleInputMouseDown}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span onDoubleClick={handleDoubleClick} className={isEditable ? 'cursor-text' : ''}>
          {label || 'Node'}
        </span>
      )}
    </div>
  );
};

export default DraggableNode;
