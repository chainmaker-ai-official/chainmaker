import React, { useState, useEffect, useRef } from 'react';

const SystemClock = ({ 
  id, 
  label, 
  type = 'default',
  isPaletteItem = false,
  onDragStart,
  onDragEnd,
  x,
  y,
  isDragging = false,
  isNew = false,
  isDeleting = false,
  onDelete,
  blockData,
  isFreeForm = false,
  onConnectionStart,
  onConnectionEnd,
  isConnected = false,
  onTick = null,
  isSelected = false,
  onClick
}) => {
  // System clock counting - increments every second (only when connected)
  const [time, setTime] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Only start ticking when the clock is connected
    if (isConnected) {
      // Start counting when connected
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          // Call the onTick callback if provided (for passing data to connected blocks)
          if (onTick) {
            onTick(newTime);
          }
          return newTime;
        });
      }, 1000);
    }

    // Cleanup: clear interval when disconnected or unmounted
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected, onTick]);
  
  // Reset time when disconnected
  useEffect(() => {
    if (!isConnected) {
      setTime(0);
    }
  }, [isConnected]);

  // Original visual rendering code - kept intact
  const [selectedPart, setSelectedPart] = useState(null);

  const rectangleColor = type === 'blockchain' ? '#64ffda' : '#00ff00';
  
  // Enhanced border style for selected blocks
  const getBorderStyle = () => {
    if (isSelected) {
      return `2px solid ${type === 'blockchain' ? '#ffcc00' : '#ff0000'}`;
    }
    return `1px solid ${type === 'blockchain' ? '#1e4976' : '#333333'}`;
  };

  // Enhanced box shadow for selected blocks
  const getBoxShadow = () => {
    if (isSelected) {
      const glowColor = type === 'blockchain' ? '#ffcc00' : '#ff0000';
      return `0 0 10px ${glowColor}, 0 0 15px ${glowColor}, inset 0 0 5px ${glowColor}`;
    }
    return 'none';
  };

  const blockStyle = {
    background: type === 'blockchain' ? '#0a1929' : '#0a0a0a',
    border: getBorderStyle(),
    color: type === 'blockchain' ? '#64ffda' : '#00ff00',
    cursor: isPaletteItem ? 'grab' : 'move',
    padding: '12px 20px 10px 20px',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontWeight: '500',
    textAlign: 'center',
    minWidth: '120px',
    userSelect: 'none',
    position: 'absolute',
    left: x !== undefined ? `${x}px` : 'auto',
    top: y !== undefined ? `${y}px` : 'auto',
    transition: 'border 0.2s ease-out, box-shadow 0.2s ease-out',
    boxShadow: getBoxShadow(),
    zIndex: isSelected ? 10 : 1
  };

  const topBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    height: '2px',
    position: 'absolute',
    top: '-1px',
    left: '0',
    padding: '0 8px',
    boxSizing: 'border-box',
    pointerEvents: 'auto',
    cursor: 'pointer'
  };

  const topRectangleStyle = {
    width: '10px',
    height: '2px',
    backgroundColor: rectangleColor,
    borderRadius: '0',
    boxShadow: selectedPart === 'inputs' ? `0 0 8px ${rectangleColor}, 0 0 12px ${rectangleColor}` : 'none',
    transition: 'box-shadow 0.2s ease-in-out'
  };

  const bottomBarStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%',
    height: '2px',
    position: 'absolute',
    bottom: '-1px',
    left: '0',
    padding: '0 8px',
    boxSizing: 'border-box',
    pointerEvents: 'auto',
    cursor: 'pointer'
  };

  const bottomRectangleStyle = {
    width: '10px',
    height: '2px',
    backgroundColor: '#ff00ff',
    borderRadius: '0',
    boxShadow: selectedPart === 'output' ? '0 0 8px #ff00ff, 0 0 12px #ff00ff' : 'none',
    transition: 'box-shadow 0.2s ease-in-out',
    cursor: 'crosshair' // Visual hint that this is for connecting
  };

  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = isPaletteItem ? 'copy' : 'move';
    if (isPaletteItem) {
      const blockData = { id, label, type };
      e.dataTransfer.setData('application/x-palette-block', JSON.stringify(blockData));
    } else {
      e.dataTransfer.setData('text/plain', id);
    }
    if (onDragStart) onDragStart(id);
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) onDragEnd();
  };

  // --- Handle Connection Logic ---
  const handleOutputMouseDown = (e) => {
    e.stopPropagation();
    // Prevent the block from starting its own drag-and-drop
    e.preventDefault(); 
    if (onConnectionStart) {
      onConnectionStart(id, 'output', e);
    }
  };

  const handleBlockClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
  };

  const className = [
    'draggable-block',
    isPaletteItem ? 'palette-block' : 'workspace-block',
    isDragging ? 'is-dragging' : '',
    isNew ? 'block-fade-in' : '',
    isDeleting ? 'block-fade-out' : '',
    isSelected ? 'block-selected' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      style={blockStyle}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleBlockClick}
      data-block-id={id}
    >
      {!isPaletteItem && onDelete && (
        <button 
          className="delete-block-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          title="Delete block"
        >
          ×
        </button>
      )}
      
      <div 
        style={topBarStyle} 
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPart(selectedPart === 'inputs' ? null : 'inputs');
        }}
      >
        <div style={topRectangleStyle}></div>
        <div style={topRectangleStyle}></div>
        <div style={topRectangleStyle}></div>
      </div>

      <div 
        style={bottomBarStyle}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPart(selectedPart === 'output' ? null : 'output');
        }}
      >
        <div 
          style={bottomRectangleStyle}
          onMouseDown={handleOutputMouseDown}
        ></div>
      </div>
      
      {label}
    </div>
  );
};

export default SystemClock;