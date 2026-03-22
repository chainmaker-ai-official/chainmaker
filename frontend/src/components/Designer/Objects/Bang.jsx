import React, { useState, useEffect } from 'react';

const Bang = ({ 
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
  onBang = null,
  isSelected = false,
  onClick
}) => {
  const [isOn, setIsOn] = useState(false);

  // Auto-turn off after 250ms (quarter second) - "bang" effect
  useEffect(() => {
    if (isOn) {
      const timer = setTimeout(() => {
        setIsOn(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOn]);

  // Use app's theme colors - cyan/teal for consistency
  const primaryColor = '#56B6C2'; // App's primary cyan color
  const secondaryColor = '#0a1525'; // App's dark background color
  
  // Calculate adjusted position to center the 60x60 Bang block under cursor
  // Drag/drop logic uses offset of -50, -25 for all blocks
  // For a 60x60 block to be centered, we need offset of -30, -30
  // So adjust by +20 horizontally and +5 vertically
  const adjustedX = x !== undefined ? x + 20 : x;
  const adjustedY = y !== undefined ? y + 5 : y;
  
  // Enhanced border style for selected blocks
  const getBorderStyle = () => {
    if (isSelected) {
      return `2px solid #ffcc00`;
    }
    return `1px solid #1e4976`;
  };

  // Enhanced box shadow for selected blocks
  const getBoxShadow = () => {
    if (isSelected) {
      const glowColor = '#ffcc00';
      return `0 0 10px ${glowColor}, 0 0 15px ${glowColor}, inset 0 0 5px ${glowColor}, 0 2px 4px rgba(0, 0, 0, 0.3)`;
    }
    return `0 2px 4px rgba(0, 0, 0, 0.3)`;
  };

  // Container styles - rectangular border around the circle
  const containerStyle = {
    width: '60px',
    height: '60px',
    position: 'absolute',
    left: adjustedX !== undefined ? `${adjustedX}px` : 'auto',
    top: adjustedY !== undefined ? `${adjustedY}px` : 'auto',
    border: getBorderStyle(),
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'none', // Remove transition for immediate positioning
    boxShadow: getBoxShadow(),
    userSelect: 'none',
    backgroundColor: 'transparent'
  };

  // Circle styles - toggle between dark (off) and cyan (on) - only background changes
  const circleStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: isOn ? primaryColor : secondaryColor,
    border: `2px solid #1e4976`, // Same border color in both states
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease-in-out',
    userSelect: 'none'
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

  // Handle Connection Logic - output port
  const handleOutputMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onConnectionStart) {
      onConnectionStart(id, 'output', e);
    }
  };

  // Output port positioning - matches DraggableBlock.jsx exactly
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
    cursor: 'crosshair'
  };

  // Handle click to toggle
  const handleBangClick = (e) => {
    e.stopPropagation();
    const newState = !isOn;
    setIsOn(newState);
    // Call the onBang callback if provided, passing the new state
    if (onBang) {
      onBang(id, newState);
    }
  };

  // Handle block selection click
  const handleBlockClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
  };

  // Don't include 'block-fade-in' class for Bang blocks to prevent animation
  const className = [
    'draggable-block',
    isPaletteItem ? 'palette-block' : 'workspace-block',
    isDragging ? 'is-dragging' : '',
    // Skip 'block-fade-in' class to prevent animation on drop
    isDeleting ? 'block-fade-out' : '',
    isSelected ? 'block-selected' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      style={containerStyle}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleBlockClick}
      data-block-id={id}
    >
      {/* The clickable circle inside the container */}
      <div
        style={circleStyle}
        onClick={handleBangClick}
      >
        {!isPaletteItem && onDelete && (
          <button 
            className="delete-block-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            title="Delete block"
            style={{ zIndex: 100 }}
          >
            ×
          </button>
        )}
      </div>
      
      {/* Output port for connections - matches DraggableBlock.jsx positioning */}
      <div 
        style={bottomBarStyle}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div 
          style={bottomRectangleStyle}
          onMouseDown={handleOutputMouseDown}
        ></div>
      </div>
    </div>
  );
};

export default Bang;