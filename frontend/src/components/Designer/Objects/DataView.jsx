import React from 'react';
import './DataView.css';

const DataView = ({ 
  id, 
  label, 
  type = 'data',
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
  // Data prop for displaying JSON data from connected components
  data = null,
  // Wire connection props
  onConnectionStart,
  onConnectionEnd,
  isConnected = false,
  // Selection prop
  isSelected = false,
  // Block click handler for selection
  onClick = null
}) => {
  // Default sample data if no data provided
  const displayData = data || {
    source: 'Live Order Book',
    timestamp: new Date().toISOString(),
    status: 'No data connected',
    message: 'Connect to a data source using draggable lines'
  };

  const getBlockStyle = () => {
    const colorConfigs = {
      data: {
        primary: '#0a1929',
        secondary: '#64ffda',
        gradient: '#0a1929',
        border: '#1e4976',
        textShadow: 'none'
      },
      blockchain: {
        primary: '#0a1929',
        secondary: '#64ffda',
        gradient: '#0a1929',
        border: '#1e4976',
        textShadow: 'none'
      },
      default: {
        primary: '#0a1929',
        secondary: '#64ffda',
        gradient: '#0a1929',
        border: '#1e4976',
        textShadow: 'none'
      }
    };
    
    const config = colorConfigs[type] || colorConfigs.data;
    
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
        minHeight: '300px'
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

  // Format JSON data for display
  const formatDataForDisplay = () => {
    try {
      return JSON.stringify(displayData, null, 2);
    } catch (error) {
      return `Error formatting data: ${error.message}`;
    }
  };

  const content = (
    <div className="data-view-content">
      <div className="data-view-header">
        <div className="data-view-title">
          <span className="data-view-icon">📊</span>
          <span className="data-view-label">{label || 'Data View'}</span>
          {!isPaletteItem && onDelete && (
            <button 
              className="data-view-delete-btn"
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
        <div className="data-view-subtitle">
          JSON Data Viewer
        </div>
      </div>
      
      <div className="data-view-display">
        <div className="data-display-title">Data Output</div>
        <div className="data-display-content">
          <pre className="json-display">{formatDataForDisplay()}</pre>
        </div>
      </div>
      
      <div className="data-view-footer">
        <div className="footer-text">
          {displayData.status === 'No data connected' 
            ? 'Waiting for data connection...' 
            : `Data from: ${displayData.source || 'Unknown source'}`}
        </div>
      </div>
    </div>
  );

  // --- PALETTE ITEM (HTML5 Drag-and-Drop) ---
  if (isPaletteItem) {
    return (
      <div
        className={`data-view-draggable-box palette-block`}
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
      className={`data-view-draggable-box workspace-block ${isDragging ? 'is-dragging' : ''} ${isNew ? 'block-fade-in' : ''} ${isDeleting ? 'block-fade-out' : ''}`}
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
      {/* Connection point for wire connections - top left input port */}
      {!isPaletteItem && onConnectionStart && (
        <div 
          className={`connection-point input ${isConnected ? 'connected' : ''}`}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (onConnectionStart) onConnectionStart(id, 'input', e);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            if (onConnectionEnd) onConnectionEnd(id, 'input', e);
          }}
          title="Click to receive wire connection"
        />
      )}
    </div>
  );
};

export default DataView;
