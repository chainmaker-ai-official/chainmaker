import React, { useState } from 'react';
import './LiveOrderBookDraggableBox.css';

const LiveOrderBookDraggableBox = ({ 
  id, 
  label, 
  type = 'blockchain',
  isPaletteItem = false,
  onDragStop,
  onDragStart,
  onDragEnter, 
  onDragEnd,
  isDragging,
  isNew,
  isDeleting,
  onDelete,
  blockData,
  onDoubleClick,
  x,
  y,
  isFreeForm = false,
  // Wire connection props
  onConnectionStart,
  onConnectionEnd,
  isConnected = false,
  // Selection prop
  isSelected = false,
  // Block click handler for selection
  onClick = null
}) => {
  const [settings, setSettings] = useState({
    marketPair: 'SOL/USDC',
    refreshInterval: '50ms',
    connectionStatus: 'disconnected',
    dexSource: 'Raydium'
  });
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(true);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getBlockStyle = () => {
    const colorConfigs = {
      blockchain: {
        primary: '#0a1929',
        secondary: '#64ffda',
        gradient: '#0a1929',
        border: '#1e4976',
        textShadow: 'none'
      }
    };
    
    const config = colorConfigs[type] || colorConfigs.blockchain;
    
    const baseStyle = {
      background: config.gradient,
      border: `2px solid ${config.border}`,
      cursor: isPaletteItem ? 'grab' : 'move',
      color: config.secondary,
      padding: '0',
      marginBottom: '0px',
      textShadow: config.textShadow,
      fontWeight: '500',
      letterSpacing: '0.01em',
      transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease, transform 0.2s ease',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      textAlign: 'center',
      minWidth: '0',
      minHeight: '0',
      position: 'relative',
      overflow: 'hidden',
      pointerEvents: 'auto',
      zIndex: '2',
      fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace"
    };
    
    if (isFreeForm && x !== undefined && y !== undefined) {
      return {
        ...baseStyle,
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 1000,
        width: 'auto',
        height: 'auto',
        minWidth: '250px',
        minHeight: '300px',
        // DEBUG: Make block highly visible
        backgroundColor: '#ff0000 !important',
        border: '5px solid yellow !important',
        boxShadow: '0 0 20px #00ff00 !important'
      };
    } else {
      return baseStyle;
    }
  };
  
  const style = getBlockStyle();
  
  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    if (onDragStart) onDragStart(id);
  };

  const content = (
    <div className="live-order-book-draggable-content">
      <div className="live-order-book-header">
        <div className="live-order-book-title">
          <span className="live-order-book-icon">📊</span>
          <span className="live-order-book-label">{label || 'Live Order Book'}</span>
          {!isPaletteItem && onDelete && (
            <button 
              className="live-order-book-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              title="Delete block"
            >
              &times;
            </button>
          )}
        </div>
        <div className="live-order-book-subtitle">
          Real-time DEX Order Book
        </div>
      </div>
      
      <div className="live-order-book-settings">
        <div className="setting-group">
          <label className="setting-label">Market Pair</label>
          <input
            type="text"
            className="setting-input"
            value={settings.marketPair}
            onChange={(e) => handleSettingChange('marketPair', e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="e.g., SOL/USDC"
          />
        </div>
        
        <div className="setting-group">
          <label className="setting-label">Refresh Interval</label>
          <select
            className="setting-select"
            value={settings.refreshInterval}
            onChange={(e) => handleSettingChange('refreshInterval', e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="50ms">50ms (High Frequency)</option>
            <option value="100ms">100ms (Standard)</option>
            <option value="500ms">500ms (Low Frequency)</option>
            <option value="1s">1s (Slow)</option>
          </select>
        </div>
        
        <div className="setting-group">
          <label className="setting-label">DEX Source</label>
          <select
            className="setting-select"
            value={settings.dexSource}
            onChange={(e) => handleSettingChange('dexSource', e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="Raydium">Raydium (Solana)</option>
            <option value="Uniswap V3">Uniswap V3 (Ethereum)</option>
            <option value="PancakeSwap">PancakeSwap (BSC)</option>
            <option value="Orca">Orca (Solana)</option>
          </select>
        </div>
        
        <div className="setting-group">
          <label className="setting-label">Connection Status</label>
          <div className="connection-status-indicator">
            <div className={`status-dot ${settings.connectionStatus}`}></div>
            <span className="status-text">
              {settings.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <button 
            className="connection-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleSettingChange('connectionStatus', 
                settings.connectionStatus === 'connected' ? 'disconnected' : 'connected'
              );
            }}
          >
            {settings.connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>
      
      <div className="live-order-book-preview">
        <div 
          className="preview-title" 
          onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
          style={{ cursor: 'pointer' }}
        >
          Preview
          <span className="collapse-icon" style={{ marginLeft: '8px' }}>
            {isPreviewCollapsed ? '▶' : '▼'}
          </span>
        </div>
        {!isPreviewCollapsed && (
          <div className="preview-content">
            <div className="bid-ask-preview">
              <div className="bid-side">
                <div className="side-label">Bids</div>
                <div className="preview-row">100.50 × 500</div>
                <div className="preview-row">100.45 × 300</div>
                <div className="preview-row">100.40 × 200</div>
              </div>
              <div className="ask-side">
                <div className="side-label">Asks</div>
                <div className="preview-row">100.55 × 400</div>
                <div className="preview-row">100.60 × 600</div>
                <div className="preview-row">100.65 × 300</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="live-order-book-footer">
        <div className="footer-text">Configure settings above</div>
      </div>
    </div>
  );

  // --- PALETTE ITEM (HTML5 Drag-and-Drop) ---
  if (isPaletteItem) {
    return (
      <div
        className={`live-order-book-draggable-box palette-block`}
        style={style}
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'copy';
          const dataToTransfer = blockData ? blockData : { id, label, type };
          e.dataTransfer.setData('application/x-palette-block', JSON.stringify(dataToTransfer));
          e.dataTransfer.setData('text/plain', id);
        }}
        onDragEnd={(e) => {
          if (onDragEnd) onDragEnd();
        }}
      >
        {content}
      </div>
    );
  }

  // --- WORKSPACE ITEM (Native HTML5 DnD) ---
  return (
    <div
      id={id}
      data-block-id={id}
      className={`live-order-book-draggable-box workspace-block ${isDragging ? 'is-dragging' : ''} ${isNew ? 'block-fade-in' : ''} ${isDeleting ? 'block-fade-out' : ''}`}
      style={style}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDragEnter) onDragEnter(id);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!isPaletteItem && onDoubleClick) {
          onDoubleClick(blockData || { id, label, type });
        }
      }}
    >
      {content}
      {/* Connection point for wire connections - bottom right output port */}
      {!isPaletteItem && onConnectionStart && (
        <div 
          className={`connection-point output ${isConnected ? 'connected' : ''}`}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (onConnectionStart) onConnectionStart(id, 'output', e);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            if (onConnectionEnd) onConnectionEnd(id, 'output', e);
          }}
          title="Click and drag to create a wire connection"
        />
      )}
    </div>
  );
};

export default LiveOrderBookDraggableBox;