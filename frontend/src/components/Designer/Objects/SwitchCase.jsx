import React, { useState, useEffect, useRef } from 'react';

const SwitchCase = ({ 
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
  onLabelChange,
  isSelected = false,
  onClick
}) => {
  const [selectedPart, setSelectedPart] = useState(null);
  const [cases, setCases] = useState([
    'price > 100',
    'price < 50', 
    'RSI > 70'
  ]);
  const [defaultCase, setDefaultCase] = useState('Hold Position');
  const [isAddingCase, setIsAddingCase] = useState(false);
  const inputRef = useRef(null);

  // Auto-enter edit mode when block is new and editable
  useEffect(() => {
    if (isNew && isEditable && !isPaletteItem) {
      // Focus the input after a small delay to ensure it's rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Select all text to make it easy to replace
          inputRef.current.select();
        }
      }, 0);
    }
  }, [isNew, isEditable, isPaletteItem]);

  const rectangleColor = type === 'blockchain' ? '#64ffda' : '#00ff00';
  const outputPortColor = '#ff00ff';

  // Calculate dynamic dimensions based on content - significantly wider for trading expressions
  const calculateBlockDimensions = () => {
    const caseCount = cases.length;
    const baseWidth = 460; // Much wider for trading strategy expressions and better spacing
    const baseHeight = 80 + (caseCount * 36); // Height increases with cases, 36px per row
    return { width: baseWidth, height: baseHeight };
  };

  const dimensions = calculateBlockDimensions();

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
    padding: '12px 16px 12px 12px',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontWeight: '500',
    textAlign: 'left',
    width: `${dimensions.width}px`,
    minWidth: '200px',
    minHeight: `${dimensions.height}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    userSelect: 'none',
    position: 'absolute',
    left: x !== undefined ? `${x}px` : 'auto',
    top: y !== undefined ? `${y}px` : 'auto',
    boxSizing: 'border-box',
    transition: 'width 0.1s ease-out, height 0.1s ease-out, border 0.2s ease-out, box-shadow 0.2s ease-out',
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

  // --- Handle Connection Logic for each output port ---
  const handleOutputMouseDown = (e, index) => {
    e.stopPropagation();
    e.preventDefault(); 
    if (onConnectionStart) {
      onConnectionStart(id, `output-${index}`, e);
    }
  };

  // Handle block selection click
  const handleBlockClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
  };

  // Handle adding new case
  const handleAddCase = () => {
    setCases([...cases, `Case ${cases.length + 1}`]);
    setIsAddingCase(false);
  };

  // Handle removing case
  const handleRemoveCase = (index) => {
    if (cases.length > 1) {
      const newCases = cases.filter((_, i) => i !== index);
      setCases(newCases);
    }
  };

  // Handle case condition change
  const handleCaseChange = (index, value) => {
    const newCases = [...cases];
    newCases[index] = value;
    setCases(newCases);
  };

  // Handle default case change
  const handleDefaultChange = (value) => {
    setDefaultCase(value);
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

      <div 
        style={topBarStyle} 
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPart(selectedPart === 'inputs' ? null : 'inputs');
        }}
      >
        <div style={topRectangleStyle}></div>
        <div style={topRectangleStyle}></div>
      </div>

      {/* Main switch value input - trading strategy focused */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#999' }}>Switch Value:</div>
        <input
          type="text"
          ref={inputRef}
          style={{
            background: 'transparent',
            border: '1px solid #3a4a5a',
            borderRadius: '4px',
            color: 'inherit',
            fontSize: '12px',
            padding: '4px 6px',
            width: '180px',
            outline: 'none',
            boxSizing: 'border-box',
            caretColor: rectangleColor
          }}
          value={label || ''}
          placeholder="e.g., currentPrice, RSI, marketCondition"
          onChange={(e) => onLabelChange && onLabelChange(id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div style={{ marginBottom: '10px', fontSize: '14px', color: rectangleColor, fontWeight: 'bold' }}>
        TRADING SWITCH
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {cases.map((caseValue, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', height: '28px' }}>
            <div style={{ fontSize: '12px', color: '#999', minWidth: '60px' }}>Case {index + 1}:</div>
            <input
              type="text"
              style={{
                background: 'transparent',
                border: '1px solid #3a4a5a',
                borderRadius: '4px',
                color: 'inherit',
                fontSize: '12px',
                padding: '4px 6px',
                width: '280px',
                outline: 'none',
                boxSizing: 'border-box',
                caretColor: rectangleColor
              }}
              value={caseValue}
              placeholder="condition (e.g., price > 100, RSI < 30)"
              onChange={(e) => handleCaseChange(index, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleRemoveCase(index); }}
              style={{
                background: '#ff4d4f',
                border: 'none',
                borderRadius: '3px',
                color: 'white',
                fontSize: '10px',
                padding: '2px 5px',
                cursor: 'pointer',
                marginLeft: '4px'
              }}
            >
              ×
            </button>
            {/* Output port for this case - positioned within the row relative container */}
            <div 
              style={{
                position: 'absolute',
                right: '-6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '10px',
                height: '2px',
                backgroundColor: outputPortColor,
                borderRadius: '0',
                boxShadow: selectedPart === `output-${index}` ? `0 0 8px ${outputPortColor}, 0 0 12px ${outputPortColor}` : 'none',
                transition: 'box-shadow 0.2s ease-in-out',
                cursor: 'crosshair'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPart(selectedPart === `output-${index}` ? null : `output-${index}`);
              }}
              onMouseDown={(e) => handleOutputMouseDown(e, index)}
            ></div>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', position: 'relative', height: '28px' }}>
          <div style={{ fontSize: '12px', color: '#999', minWidth: '60px' }}>Default:</div>
          <input
            type="text"
            style={{
              background: 'transparent',
              border: '1px solid #3a4a5a',
              borderRadius: '4px',
              color: 'inherit',
              fontSize: '12px',
              padding: '4px 6px',
              width: '200px',
              outline: 'none',
              boxSizing: 'border-box',
              caretColor: rectangleColor
            }}
            value={defaultCase}
            placeholder="default action (e.g., Hold Position, Wait for Signal)"
            onChange={(e) => handleDefaultChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          {/* Default output port - positioned within the row relative container */}
          <div 
            style={{
              position: 'absolute',
              right: '-6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '10px',
              height: '2px',
              backgroundColor: outputPortColor,
              borderRadius: '0',
              boxShadow: selectedPart === 'default-output' ? `0 0 8px ${outputPortColor}, 0 0 12px ${outputPortColor}` : 'none',
              transition: 'box-shadow 0.2s ease-in-out',
              cursor: 'crosshair'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPart(selectedPart === 'default-output' ? null : 'default-output');
            }}
            onMouseDown={(e) => handleOutputMouseDown(e, 'default')}
          ></div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleAddCase(); }}
            style={{
              background: '#007bff',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              padding: '4px 8px',
              cursor: 'pointer'
            }}
          >
            + Add Trading Case
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwitchCase;