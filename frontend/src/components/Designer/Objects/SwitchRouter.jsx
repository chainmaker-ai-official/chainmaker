import React, { useState, useEffect, useRef } from 'react';

const SwitchRouter = ({ 
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
  isEditable = false,
  onLabelChange
}) => {
  const [selectedPart, setSelectedPart] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isNew && isEditable && !isPaletteItem) {
      setIsEditing(true);
      setEditValue('');
      setHasUserTyped(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0);
    }
  }, [isNew, isEditable, isPaletteItem]);

  const rectangleColor = type === 'blockchain' ? '#64ffda' : '#ED7D31';
  
  const calculateBlockWidth = () => {
    if (isEditing) {
      const textLength = editValue.length;
      const baseWidth = 40;
      const charWidth = 8;
      return Math.max(baseWidth, baseWidth + (textLength * charWidth));
    } else {
      const displayText = editValue || '\u00A0';
      const textLength = displayText.length;
      const baseWidth = 40;
      const charWidth = 8;
      return Math.max(baseWidth, baseWidth + (textLength * charWidth));
    }
  };

  const blockStyle = {
    background: type === 'blockchain' ? '#0a1929' : '#1a1a2e',
    border: `1px solid ${type === 'blockchain' ? '#1e4976' : '#ED7D31'}`,
    color: type === 'blockchain' ? '#64ffda' : '#ED7D31',
    cursor: isPaletteItem ? 'grab' : 'move',
    padding: '8px 12px 6px 12px',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontWeight: '500',
    textAlign: 'center',
    width: `${calculateBlockWidth()}px`,
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
    transition: 'width 0.1s ease-out'
  };

  const topBarStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
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
    justifyContent: 'space-between',
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
    backgroundColor: '#00ffff',
    borderRadius: '0',
    boxShadow: selectedPart === 'output-1' ? '0 0 8px #00ffff, 0 0 12px #00ffff' : 'none',
    transition: 'box-shadow 0.2s ease-in-out',
    cursor: 'crosshair'
  };

  const bottomRectangleStyle2 = {
    width: '10px',
    height: '2px',
    backgroundColor: '#ffff00',
    borderRadius: '0',
    boxShadow: selectedPart === 'output-2' ? '0 0 8px #ffff00, 0 0 12px #ffff00' : 'none',
    transition: 'box-shadow 0.2s ease-in-out',
    cursor: 'crosshair'
  };

  const bottomRectangleStyle3 = {
    width: '10px',
    height: '2px',
    backgroundColor: '#ff00ff',
    borderRadius: '0',
    boxShadow: selectedPart === 'output-3' ? '0 0 8px #ff00ff, 0 0 12px #ff00ff' : 'none',
    transition: 'box-shadow 0.2s ease-in-out',
    cursor: 'crosshair'
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

  const handleOutputMouseDown = (e, portType) => {
    e.stopPropagation();
    e.preventDefault();
    if (onConnectionStart) {
      onConnectionStart(id, portType, e);
    }
  };

  const handleDoubleClick = (e) => {
    if (isEditable && !isPaletteItem) {
      e.stopPropagation();
      setIsEditing(true);
      setEditValue(label || '');
      setHasUserTyped(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0);
    }
  };

  const handleInputChange = (e) => {
    setEditValue(e.target.value);
    if (!hasUserTyped && e.target.value.trim() !== '') {
      setHasUserTyped(true);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const finalValue = editValue.trim();
    let newValue = finalValue;
    if (!hasUserTyped && finalValue === '') {
      newValue = '';
    }
    setEditValue(newValue);
    if (onLabelChange) {
      onLabelChange(id, newValue);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(label || '');
    }
    e.stopPropagation();
  };

  const className = [
    'draggable-block',
    isPaletteItem ? 'palette-block' : 'workspace-block',
    isDragging ? 'is-dragging' : '',
    isNew ? 'block-fade-in' : '',
    isDeleting ? 'block-fade-out' : ''
  ].filter(Boolean).join(' ');

  const inputStyle = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'inherit',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontSize: 'inherit',
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
    minWidth: '30px',
    maxWidth: '100%',
    minHeight: '18px',
    lineHeight: '1.2',
    caretColor: type === 'blockchain' ? '#64ffda' : '#ED7D31',
    boxSizing: 'border-box',
    flex: '1 1 auto'
  };

  return (
    <div
      className={className}
      style={blockStyle}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
      </div>

      <div 
        style={bottomBarStyle}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div 
          style={bottomRectangleStyle}
          onMouseDown={(e) => handleOutputMouseDown(e, 'output-1')}
          title="Output 1"
        ></div>
        <div 
          style={bottomRectangleStyle2}
          onMouseDown={(e) => handleOutputMouseDown(e, 'output-2')}
          title="Output 2"
        ></div>
        <div 
          style={bottomRectangleStyle3}
          onMouseDown={(e) => handleOutputMouseDown(e, 'output-3')}
          title="Output 3"
        ></div>
      </div>
      
      {isEditable && !isPaletteItem ? (
        isEditing ? (
          <input
            type="text"
            style={inputStyle}
            value={editValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span 
            onDoubleClick={handleDoubleClick}
            style={{ cursor: 'text' }}
          >
            {editValue || 'Router'}
          </span>
        )
      ) : (
        <span>{(typeof label === 'string' && label.trim() !== '') ? label : 'Router'}</span>
      )}
    </div>
  );
};

export default SwitchRouter;
