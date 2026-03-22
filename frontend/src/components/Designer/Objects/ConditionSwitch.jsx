import React, { useState, useEffect, useRef } from 'react';

const ConditionSwitch = ({ 
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
  onConnectionStart,
  onLabelChange,
  isEditable = false,
  isSelected = false,
  onClick
}) => {
  const [selectedPart, setSelectedPart] = useState(null);
  const [leftValue, setLeftValue] = useState('');
  const [operator, setOperator] = useState('>');
  const [rightValue, setRightValue] = useState('');
  const inputRef = useRef(null);

  // Parse initial label into condition parts
  useEffect(() => {
    if (label && label.trim()) {
      const match = label.match(/(\w+)\s*(==|!=|>=|<=|>|<)\s*(\w+)/i);
      if (match) {
        setLeftValue(match[1]);
        setOperator(match[2]);
        setRightValue(match[3]);
      } else {
        setLeftValue(label); // Fallback if not a full condition
      }
    }
  }, [label]);

  const primaryColor = '#56B6C2';
  const rectangleColor = '#00ff00'; // Kept from original style for connection points

  const calculateWidth = () => {
    const content = `${leftValue}${operator}${rightValue}`;
    return Math.max(140, content.length * 11 + 60);
  };

  // Enhanced border style for selected blocks
  const getBorderStyle = () => {
    if (isSelected) {
      return `2px solid #ffcc00`;
    }
    return `1px solid ${primaryColor}`;
  };

  // Enhanced box shadow for selected blocks
  const getBoxShadow = () => {
    if (isSelected) {
      const glowColor = '#ffcc00';
      return `0 0 10px ${glowColor}, 0 0 15px ${glowColor}, inset 0 0 5px ${glowColor}, 0 2px 4px rgba(0, 0, 0, 0.3)`;
    }
    return `0 2px 4px rgba(0, 0, 0, 0.3)`;
  };

  // --- Styles ---
  const containerStyle = {
    width: `${calculateWidth()}px`,
    minHeight: '40px',
    position: 'absolute',
    left: x !== undefined ? `${x}px` : 'auto',
    top: y !== undefined ? `${y}px` : 'auto',
    background: '#0a1525',
    border: getBorderStyle(),
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 10px',
    gap: '6px',
    userSelect: 'none',
    boxSizing: 'border-box',
    cursor: isPaletteItem ? 'grab' : 'move',
    transition: 'width 0.1s ease-out, border 0.2s ease-out, box-shadow 0.2s ease-out',
    boxShadow: getBoxShadow(),
    zIndex: isSelected ? 10 : 1
  };

  const inputStyle = {
    background: '#1a2a3a',
    border: '1px solid #3a4a5a',
    borderRadius: '4px',
    color: '#ABB2BF',
    fontFamily: "'Consolas', 'Monaco', monospace",
    fontSize: '13px',
    textAlign: 'center',
    width: '50px',
    outline: 'none',
    padding: '2px 4px',
    caretColor: primaryColor,
  };

  const operatorStyle = {
    color: primaryColor,
    fontFamily: "'Consolas', 'Monaco', monospace",
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    minWidth: '24px',
    textAlign: 'center',
  };

  const connectionPointStyle = {
    width: '10px',
    height: '2px',
    backgroundColor: rectangleColor,
    borderRadius: '0',
    transition: 'box-shadow 0.2s ease-in-out'
  };

  // --- Handlers ---
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

  const handleOutputMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault(); 
    if (onConnectionStart) onConnectionStart(id, 'output', e);
  };

  const handleBlur = () => {
    const conditionStr = leftValue && rightValue ? `${leftValue}${operator}${rightValue}` : leftValue;
    if (onLabelChange) onLabelChange(id, conditionStr);
  };

  const cycleOperator = () => {
    const ops = ['>', '<', '>=', '<=', '==', '!='];
    const idx = ops.indexOf(operator);
    setOperator(ops[(idx + 1) % ops.length]);
    // Trigger update after state change
    const nextOp = ops[(idx + 1) % ops.length];
    if (onLabelChange) onLabelChange(id, `${leftValue}${nextOp}${rightValue}`);
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
      style={containerStyle}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleBlockClick}
      data-block-id={id}
    >
      {/* Delete Button */}
      {!isPaletteItem && onDelete && (
        <button 
          className="delete-block-btn"
          onClick={(e) => { e.stopPropagation(); onDelete(id); }}
          style={{
            position: 'absolute', top: '-10px', right: '-10px',
            background: '#ff4d4f', color: 'white', border: 'none',
            borderRadius: '50%', width: '18px', height: '18px',
            fontSize: '12px', cursor: 'pointer', zIndex: 10
          }}
        >
          ×
        </button>
      )}

      {/* Connection Top Bar (Inputs) */}
      <div 
        style={{ position: 'absolute', top: '-1px', left: 0, width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}
        onClick={(e) => { e.stopPropagation(); setSelectedPart('inputs'); }}
      >
        <div style={{...connectionPointStyle, boxShadow: selectedPart === 'inputs' ? `0 0 8px ${rectangleColor}` : 'none'}}></div>
        <div style={{...connectionPointStyle, boxShadow: selectedPart === 'inputs' ? `0 0 8px ${rectangleColor}` : 'none'}}></div>
      </div>

      {/* Connection Bottom Bar (Output) */}
      <div 
        style={{ position: 'absolute', bottom: '-1px', left: 0, width: '100%', display: 'flex', padding: '0 8px' }}
        onClick={(e) => { e.stopPropagation(); setSelectedPart('output'); }}
      >
        <div 
          style={{...connectionPointStyle, backgroundColor: '#ff00ff', cursor: 'crosshair', boxShadow: selectedPart === 'output' ? '0 0 8px #ff00ff' : 'none'}}
          onMouseDown={handleOutputMouseDown}
        ></div>
      </div>

      {/* Content: Left Value */}
      <input
        ref={inputRef}
        type="text"
        style={inputStyle}
        value={leftValue}
        placeholder="val"
        onChange={(e) => setLeftValue(e.target.value)}
        onBlur={handleBlur}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Content: Operator Switch */}
      <span 
        style={operatorStyle}
        onClick={(e) => { e.stopPropagation(); cycleOperator(); }}
      >
        {operator}
      </span>

      {/* Content: Right Value */}
      <input
        type="text"
        style={inputStyle}
        value={rightValue}
        placeholder="val"
        onChange={(e) => setRightValue(e.target.value)}
        onBlur={handleBlur}
        onClick={(e) => e.stopPropagation()}
      />

      <style>{`
        input:focus { border-color: ${primaryColor} !important; }
        .is-dragging { opacity: 0.6; }
      `}</style>
    </div>
  );
};

export default ConditionSwitch;