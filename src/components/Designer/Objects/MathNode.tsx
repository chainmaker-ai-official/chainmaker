import React, { useState } from 'react';
import NodeSettingsModal, { SettingField } from '../components/NodeSettingsModal';
import { Calculator } from 'lucide-react';

const MathNode: React.FC<any> = ({ 
  id, label, type = 'default', isPaletteItem = false, onDragStart, onDragEnd, x, y,
  isDragging = false, isNew = false, isDeleting = false, onDelete, onConnectionStart,
  onLabelChange, isSelected = false, onClick, onContextMenu,
  inputCount = 0, outputCount = 0
}) => {
  const [settings, setSettings] = useState({
    operation: '+',
    operandB: 0,
    useInputAsA: true
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const blockStyle: React.CSSProperties = {
    background: '#0a1525',
    border: isSelected ? `2px solid #ffcc00` : `1px solid #56B6C2`,
    color: '#56B6C2',
    cursor: isPaletteItem ? 'grab' : 'move',
    padding: '12px',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    width: isPaletteItem ? '100%' : '180px',
    userSelect: 'none',
    position: isPaletteItem ? 'relative' : 'absolute',
    left: x !== undefined ? `${x}px` : 'auto',
    top: y !== undefined ? `${y}px` : 'auto',
    zIndex: isSelected ? 10 : 1,
    borderRadius: '4px'
  };

  const fields: SettingField[] = [
    { 
      id: 'operation', 
      label: 'Operation', 
      type: 'select', 
      options: [
        { label: 'Add (+)', value: '+' },
        { label: 'Subtract (-)', value: '-' },
        { label: 'Multiply (*)', value: '*' },
        { label: 'Divide (/)', value: '/' },
        { label: 'Modulo (%)', value: '%' }
      ] 
    },
    { id: 'operandB', label: 'Constant Value (B)', type: 'number' },
    { id: 'useInputAsA', label: 'Use Input as A', type: 'boolean' }
  ];

  return (
    <>
      <div
        className={`draggable-block ${isPaletteItem ? 'palette-block' : 'workspace-block'} ${isDragging ? 'is-dragging' : ''} ${isNew ? 'block-fade-in' : ''} ${isDeleting ? 'block-fade-out' : ''}`}
        style={blockStyle}
        draggable={true}
        onDragStart={(e) => { e.stopPropagation(); onDragStart?.(id, e); }}
        onDragEnd={onDragEnd}
        onClick={onClick}
        onDoubleClick={(e) => { e.stopPropagation(); !isPaletteItem && setIsModalOpen(true); }}
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
                  style={{ backgroundColor: '#64ffda' }}
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
          <div className="absolute -top-[1px] left-0 w-full flex justify-center">
            <div className="w-2.5 h-[2px]" style={{ backgroundColor: '#64ffda' }}></div>
          </div>
        )}

        {isPaletteItem && (
          <div className="absolute -bottom-[1px] left-0 w-full flex justify-center">
            <div className="w-2.5 h-[2px] bg-[#ff00ff]"></div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-2 border-b border-[#56B6C233] pb-1">
          <Calculator size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Math Op</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-center items-center gap-2 py-1">
            <span className="text-[#ABB2BF] text-xs">Input</span>
            <span className="text-[#C678DD] font-bold">{settings.operation}</span>
            <span className="text-[#D19A66] font-bold">{settings.operandB}</span>
          </div>
        </div>
      </div>

      {!isPaletteItem && (
        <NodeSettingsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => {
            setSettings(data);
            onLabelChange?.(id, `Math: ${data.operation} ${data.operandB}`);
          }}
          title="Math Operation"
          fields={fields}
          initialData={settings}
        />
      )}
    </>
  );
};

export default MathNode;
