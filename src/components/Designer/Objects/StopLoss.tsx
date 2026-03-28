import React, { useState } from 'react';
import NodeSettingsModal, { SettingField } from '../components/NodeSettingsModal';
import { ShieldAlert } from 'lucide-react';

const StopLoss: React.FC<any> = ({ 
  id, label, type = 'default', isPaletteItem = false, onDragStart, onDragEnd, x, y,
  isDragging = false, isNew = false, isDeleting = false, onDelete, onConnectionStart,
  onLabelChange, isSelected = false, onClick, onContextMenu,
  inputCount = 0, outputCount = 0
}) => {
  const [settings, setSettings] = useState({
    type: 'PERCENTAGE',
    value: 2.0,
    trailing: false
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const blockStyle: React.CSSProperties = {
    background: '#0a1525',
    border: isSelected ? `2px solid #ffcc00` : `1px solid #C00000`,
    color: '#C00000',
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
      id: 'type', 
      label: 'SL Type', 
      type: 'select', 
      options: [
        { label: 'Percentage (%)', value: 'PERCENTAGE' },
        { label: 'Absolute (Price)', value: 'ABSOLUTE' }
      ] 
    },
    { id: 'value', label: 'Value', type: 'number' },
    { id: 'trailing', label: 'Trailing Stop', type: 'boolean' }
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

        <div className="flex items-center gap-2 mb-2 border-b border-[#C0000033] pb-1">
          <ShieldAlert size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Stop Loss</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500">Value:</span>
            <span className="text-[#E06C75]">{settings.value}{settings.type === 'PERCENTAGE' ? '%' : ''}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500">Trailing:</span>
            <span className="text-[#61AFEF]">{settings.trailing ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {!isPaletteItem && (
        <NodeSettingsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => {
            setSettings(data);
            onLabelChange?.(id, `SL: ${data.value}${data.type === 'PERCENTAGE' ? '%' : ''}`);
          }}
          title="Stop Loss"
          fields={fields}
          initialData={settings}
        />
      )}
    </>
  );
};

export default StopLoss;
