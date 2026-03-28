import React, { useState } from 'react';
import SwitchCaseModal from '../components/SwitchCaseModal';

const SwitchCase: React.FC<any> = ({ 
  id, label, type = 'default', isPaletteItem = false, onDragStart, onDragEnd, x, y,
  isDragging = false, isNew = false, isDeleting = false, onDelete, onConnectionStart,
  onLabelChange, isSelected = false, onClick, onContextMenu,
  inputCount = 0, outputCount = 0
}) => {
  const [cases, setCases] = useState(['price > 100', 'price < 50', 'RSI > 70']);
  const [defaultCase, setDefaultCase] = useState('Hold Position');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const rectangleColor = '#00ff00';
  const outputPortColor = '#ff00ff';

  const blockStyle: React.CSSProperties = {
    background: '#0a0a0a',
    border: isSelected ? `2px solid #ffcc00` : `1px solid #333333`,
    color: '#00ff00',
    cursor: isPaletteItem ? 'grab' : 'move',
    padding: '12px',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    width: isPaletteItem ? '100%' : '320px',
    userSelect: 'none',
    position: isPaletteItem ? 'relative' : 'absolute',
    left: x !== undefined ? `${x}px` : 'auto',
    top: y !== undefined ? `${y}px` : 'auto',
    zIndex: isSelected ? 10 : 1,
    transition: 'border-color 0.2s, box-shadow 0.2s'
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPaletteItem) {
      setIsModalOpen(true);
    }
  };

  const handleSave = (data: { cases: string[], defaultCase: string, label: string }) => {
    setCases(data.cases);
    setDefaultCase(data.defaultCase);
    if (onLabelChange) {
      onLabelChange(id, data.label);
    }
  };

  return (
    <>
      <div
        className={`draggable-block ${isPaletteItem ? 'palette-block' : 'workspace-block'} ${isDragging ? 'is-dragging' : ''} ${isNew ? 'block-fade-in' : ''} ${isDeleting ? 'block-fade-out' : ''}`}
        style={blockStyle}
        draggable={true}
        onDragStart={(e) => { e.stopPropagation(); onDragStart?.(id, e); }}
        onDragEnd={onDragEnd}
        onClick={onClick}
        onDoubleClick={handleDoubleClick}
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
                  style={{ backgroundColor: rectangleColor }}
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

        {isPaletteItem && (
          <div className="absolute -top-[1px] left-0 w-full flex justify-between px-2">
            <div className="w-2.5 h-[2px]" style={{ backgroundColor: rectangleColor }}></div>
            <div className="w-2.5 h-[2px]" style={{ backgroundColor: rectangleColor }}></div>
          </div>
        )}

        <div className="mb-2 text-sm font-bold uppercase tracking-wider flex items-center justify-between">
          <span>Switch Case</span>
          <span className="text-[10px] text-gray-500 font-normal lowercase italic">Double-click to edit</span>
        </div>

        <div className="flex items-center gap-2 mb-3 border-b border-[#333] pb-2">
          <div className="text-[10px] text-gray-500">Switch:</div>
          <div className="text-xs font-bold text-[#61AFEF] truncate">{label || 'unlabeled'}</div>
        </div>

        <div className="flex flex-col gap-1.5">
          {cases.slice(0, 3).map((caseValue, index) => (
            <div key={index} className="flex items-center gap-2 relative h-6 bg-[#1a1a1a] px-2 rounded-sm">
              <div className="text-[9px] text-gray-500 min-w-[40px]">Case {index + 1}:</div>
              <div className="text-[10px] truncate flex-1">{caseValue}</div>
            </div>
          ))}
          
          {cases.length > 3 && (
            <div className="text-[9px] text-gray-500 text-center italic">+{cases.length - 3} more cases...</div>
          )}

          <div className="flex items-center gap-2 mt-1 relative h-6 bg-[#1a1a1a] px-2 rounded-sm border-t border-[#333]">
            <div className="text-[9px] text-gray-500 min-w-[40px]">Default:</div>
            <div className="text-[10px] truncate flex-1">{defaultCase}</div>
          </div>
        </div>
      </div>

      {!isPaletteItem && (
        <SwitchCaseModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={{ cases, defaultCase, label: label || '' }}
        />
      )}
    </>
  );
};

export default SwitchCase;
