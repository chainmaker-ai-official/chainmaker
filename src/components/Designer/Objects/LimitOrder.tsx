import React, { useState } from 'react';
import NodeSettingsModal, { SettingField } from '../components/NodeSettingsModal';
import { FileText } from 'lucide-react';

const LimitOrder: React.FC<any> = ({ 
  id, label, type = 'default', isPaletteItem = false, onDragStart, onDragEnd, x, y,
  isDragging = false, isNew = false, isDeleting = false, onDelete, onConnectionStart,
  onLabelChange, isSelected = false, onClick, onContextMenu,
  inputCount = 0, outputCount = 0
}) => {
  const [settings, setSettings] = useState({
    price: 0,
    amount: 1.0,
    side: 'BUY',
    tif: 'GTC' // Time in Force
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const blockStyle: React.CSSProperties = {
    background: '#0a1525',
    border: isSelected ? `2px solid #ffcc00` : `1px solid #E06C75`,
    color: '#E06C75',
    cursor: isPaletteItem ? 'grab' : 'move',
    padding: '12px',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    width: isPaletteItem ? '100%' : '200px',
    userSelect: 'none',
    position: isPaletteItem ? 'relative' : 'absolute',
    left: x !== undefined ? `${x}px` : 'auto',
    top: y !== undefined ? `${y}px` : 'auto',
    zIndex: isSelected ? 10 : 1,
    borderRadius: '4px'
  };

  const fields: SettingField[] = [
    { id: 'price', label: 'Limit Price', type: 'number' },
    { id: 'amount', label: 'Amount', type: 'number' },
    { 
      id: 'side', 
      label: 'Side', 
      type: 'select', 
      options: [
        { label: 'Buy', value: 'BUY' },
        { label: 'Sell', value: 'SELL' }
      ] 
    },
    { 
      id: 'tif', 
      label: 'Time In Force', 
      type: 'select', 
      options: [
        { label: 'Good Till Cancel (GTC)', value: 'GTC' },
        { label: 'Immediate Or Cancel (IOC)', value: 'IOC' },
        { label: 'Fill Or Kill (FOK)', value: 'FOK' }
      ] 
    }
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

        <div className="flex items-center gap-2 mb-2 border-b border-[#E06C7533] pb-1">
          <FileText size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Limit Order</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500">Price:</span>
            <span className="text-[#98C379]">{settings.price}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500">Side:</span>
            <span className={settings.side === 'BUY' ? 'text-[#98C379]' : 'text-[#E06C75]'}>{settings.side}</span>
          </div>
        </div>
      </div>

      {!isPaletteItem && (
        <NodeSettingsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => {
            setSettings(data);
            onLabelChange?.(id, `Limit ${data.side}: ${data.price}`);
          }}
          title="Limit Order"
          fields={fields}
          initialData={settings}
        />
      )}
    </>
  );
};

export default LimitOrder;
