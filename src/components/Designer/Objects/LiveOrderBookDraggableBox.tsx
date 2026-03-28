import React, { useState } from 'react';
import { BarChart2, ChevronRight, X } from 'lucide-react';

const LiveOrderBookDraggableBox: React.FC<any> = ({ 
  id, label, type = 'blockchain', isPaletteItem = false, onDragStart, onDragEnd, x, y,
  isDragging, isNew, isDeleting, onDelete, onConnectionStart, onConnectionEnd,
  isConnected = false, isSelected = false, onClick, onContextMenu,
  inputCount = 0, outputCount = 0
}) => {
  const [settings, setSettings] = useState({
    marketPair: 'SOL/USDC',
    refreshInterval: '50ms',
    connectionStatus: 'disconnected',
    dexSource: 'Raydium'
  });
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(true);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const blockStyle: React.CSSProperties = {
    background: '#0a1929',
    border: isSelected ? `2px solid #ffcc00` : `2px solid #1e4976`,
    cursor: isPaletteItem ? 'grab' : 'move',
    color: '#64ffda',
    padding: '0',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontWeight: '500',
    width: isPaletteItem ? '100%' : '250px',
    height: isPaletteItem ? '100%' : 'auto',
    minHeight: isPaletteItem ? '0' : '300px',
    display: 'flex',
    flexDirection: 'column',
    position: isPaletteItem ? 'relative' : 'absolute',
    left: x !== undefined ? `${x}px` : 'auto',
    top: y !== undefined ? `${y}px` : 'auto',
    overflow: 'hidden',
    zIndex: isSelected ? 10 : 1
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    if (onDragStart) onDragStart(id, e);
  };

  return (
    <div
      id={id}
      data-block-id={id}
      className={`draggable-block ${isPaletteItem ? 'palette-block' : 'workspace-block'} ${isDragging ? 'is-dragging' : ''} ${isNew ? 'block-fade-in' : ''} ${isDeleting ? 'block-fade-out' : ''}`}
      style={blockStyle}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onContextMenu={onContextMenu}
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
                className="w-2.5 h-[2px] bg-current" 
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

      <div className="flex flex-col flex-1 bg-gradient-to-br from-[#0a1929] to-[#0d2540]">
        <div className="bg-[#1e49764d] border-b border-[#1e4976] p-3 rounded-t-lg">
          <div className="flex items-center justify-between text-[#64ffda] font-bold text-base">
            <span className="mr-2"><BarChart2 size={18} /></span>
            <span className="flex-1 text-left">{label || 'Live Order Book'}</span>
          </div>
          <div className="text-[#88aacc] text-xs mt-1 text-left opacity-80">Real-time DEX Order Book</div>
        </div>
        
        <div className="p-4 bg-[#0a1929cc] border-b border-[#1e4976]">
          <div className="mb-3.5">
            <label className="block text-[#88aacc] text-xs font-medium mb-1.5 text-left uppercase tracking-wider">Market Pair</label>
            <input type="text" className="w-full bg-[#1e49764d] border border-[#1e4976] rounded-md color-white p-2 font-mono text-sm outline-none focus:border-[#64ffda]" value={settings.marketPair} onChange={(e) => handleSettingChange('marketPair', e.target.value)} onClick={(e) => e.stopPropagation()} />
          </div>
          
          <div className="mb-3.5">
            <label className="block text-[#88aacc] text-xs font-medium mb-1.5 text-left uppercase tracking-wider">DEX Source</label>
            <select className="w-full bg-[#1e49764d] border border-[#1e4976] rounded-md color-white p-2 font-mono text-sm outline-none focus:border-[#64ffda]" value={settings.dexSource} onChange={(e) => handleSettingChange('dexSource', e.target.value)} onClick={(e) => e.stopPropagation()}>
              <option value="Raydium">Raydium (Solana)</option>
              <option value="Uniswap V3">Uniswap V3 (Ethereum)</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full ${settings.connectionStatus === 'connected' ? 'bg-[#28a745] shadow-[0_0_8px_rgba(40,167,69,0.7)] animate-pulse' : 'bg-[#dc3545]'}`}></div>
            <span className="text-white text-sm font-medium">{settings.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
          </div>
          <button className="w-full bg-[#1e497680] border border-[#1e4976] rounded-md text-[#64ffda] p-2 font-mono text-sm font-medium cursor-pointer hover:bg-[#1e4976cc] hover:border-[#64ffda]" onClick={(e) => { e.stopPropagation(); handleSettingChange('connectionStatus', settings.connectionStatus === 'connected' ? 'disconnected' : 'connected'); }}>
            {settings.connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
          </button>
        </div>
        
        <div className="flex-1 p-4 bg-[#0a192999]">
          <div className="text-[#88aacc] text-xs font-medium mb-2.5 text-left uppercase tracking-wider flex items-center justify-between cursor-pointer hover:text-[#64ffda]" onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}>
            Preview <span className={`transition-transform ${isPreviewCollapsed ? '' : 'rotate-90'}`}><ChevronRight size={14} /></span>
          </div>
          {!isPreviewCollapsed && (
            <div className="bg-[#1e497633] border border-[#1e4976] rounded-lg p-3">
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <div className="text-[#64ffda] text-xs font-bold mb-2 text-center">Bids</div>
                  <div className="bg-[#1e49764d] border border-[#1e4976] rounded text-white text-[11px] p-1.5 mb-1 text-center font-mono">100.50 x 500</div>
                </div>
                <div className="flex-1">
                  <div className="text-[#64ffda] text-xs font-bold mb-2 text-center">Asks</div>
                  <div className="bg-[#1e49764d] border border-[#1e4976] rounded text-white text-[11px] p-1.5 mb-1 text-center font-mono">100.55 x 400</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveOrderBookDraggableBox;
