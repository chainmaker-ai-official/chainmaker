import React, { useState, useEffect, useRef, useCallback } from 'react';

const GasNode = ({ 
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
  inputData = null,
  bangTriggerCount = 0,
  onPriceUpdate,
  isSelected = false,
  onClick
}) => {
  const [selectedPart, setSelectedPart] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const inputRef = useRef(null);

  // Get backend URL from environment
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

  // Fetch gas prices ONLY when THIS GasNode receives a Bang trigger
  // inputData is set by BlockRenderer from bangTriggers[block.id] - contains timestamp for each Bang click
  useEffect(() => {
    // Only fetch when inputData is present (meaning a Bang was triggered for this specific block)
    if (isPaletteItem || !inputData) return;

    const fetchGasPrice = async () => {
      setIsLoadingPrice(true);
      setPriceError(null);
      
      try {
        const response = await fetch(`${backendUrl}/api/gas/price`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPriceData(data);
        
        // If we successfully fetched data and were in edit mode, exit edit mode
        if (isEditing && data) {
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Failed to fetch gas price on Bang trigger:', error);
        setPriceError(error.message);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    // Fetch immediately when Bang is triggered for this specific block
    fetchGasPrice();
  }, [backendUrl, isPaletteItem, inputData?.timestamp]); // Use timestamp to trigger on every Bang click

  // Output gas price data to connected blocks when price is fetched/updated
  useEffect(() => {
    if (priceData && onPriceUpdate) {
      // Output propose_gwei as the main value, but include all gas price tiers
      onPriceUpdate(id, {
        value: priceData.propose_gwei,
        raw: priceData,
        type: 'gas_price'
      });
    }
  }, [priceData, onPriceUpdate, id]);

  // Auto-enter edit mode when block is new and editable, but auto-exit after a short delay
  useEffect(() => {
    if (isNew && isEditable && !isPaletteItem) {
      setIsEditing(true);
      setEditValue('Gas Node'); // Set a default label
      setHasUserTyped(false);
      // Focus the input after a small delay to ensure it's rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Select all text to make it easy to replace
          inputRef.current.select();
        }
      }, 0);
      
      // Auto-exit edit mode after 2 seconds if user hasn't typed
      const timer = setTimeout(() => {
        if (!hasUserTyped) {
          setIsEditing(false);
          if (onLabelChange) {
            onLabelChange(id, 'Gas Node');
          }
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isNew, isEditable, isPaletteItem, hasUserTyped, id, onLabelChange]);

  const rectangleColor = type === 'blockchain' ? '#64ffda' : '#00ff00';
  
  // Calculate dynamic width based on decimal places - expands to the right
  const calculateBlockWidth = () => {
    const baseWidth = 80;
    const decimalWidth = decimalPlaces > 2 ? (decimalPlaces - 2) * 7 : 0;
    
    if (isEditing) {
      const textLength = editValue.length;
      return Math.max(baseWidth, baseWidth + (textLength * 8));
    } else if (priceData && priceData.propose_gwei > 0) {
      return baseWidth + decimalWidth;
    }
    return baseWidth;
  };

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

  // Format gas price for display
  const formatGasPrice = (price, decimals = 2) => {
    if (!price || price === 0) return 'N/A';
    return `${price.toFixed(decimals)} Gwei`;
  };

  const blockStyle = {
    background: type === 'blockchain' ? '#0a1929' : '#0a0a0a',
    border: getBorderStyle(),
    color: type === 'blockchain' ? '#64ffda' : '#00ff00',
    cursor: isPaletteItem ? 'grab' : 'move',
    padding: '8px 12px 6px 12px',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontWeight: '500',
    textAlign: 'center',
    width: `${calculateBlockWidth()}px`,
    minWidth: '80px',
    minHeight: '36px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
    position: 'absolute',
    left: x !== undefined ? `${x}px` : 'auto',
    top: y !== undefined ? `${y}px` : 'auto',
    boxSizing: 'border-box',
    transition: 'width 0.15s ease-out, border 0.2s ease-out, box-shadow 0.2s ease-out',
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

  const handleOutputMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onConnectionStart) {
      onConnectionStart(id, 'output', e);
    }
  };

  // Handle block selection click
  const handleBlockClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
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
    isDeleting ? 'block-fade-out' : '',
    isSelected ? 'block-selected' : ''
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
    caretColor: type === 'blockchain' ? '#64ffda' : '#00ff00',
    boxSizing: 'border-box',
    flex: '1 1 auto'
  };

  const priceContainerStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px'
  };

  const priceTextContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px'
  };

  const priceLabelStyle = {
    fontSize: '8px',
    opacity: 0.7,
    textTransform: 'uppercase'
  };

  const priceValueStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: type === 'blockchain' ? '#64ffda' : '#00ff00'
  };

  const loadingStyle = {
    fontSize: '9px',
    opacity: 0.5,
    fontStyle: 'italic'
  };

  const incrementorContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    marginRight: '4px'
  };

  const incrementorButtonStyle = {
    width: '10px',
    height: '8px',
    borderRadius: '1px',
    background: 'transparent',
    border: `1px solid ${type === 'blockchain' ? '#64ffda' : '#00ff00'}`,
    color: type === 'blockchain' ? '#64ffda' : '#00ff00',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '6px',
    lineHeight: 1,
    padding: 0,
    transition: 'background 0.15s ease'
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    setDecimalPlaces(prev => Math.min(prev + 1, 8));
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    setDecimalPlaces(prev => Math.max(prev - 1, 0));
  };

  const renderContent = () => {
    if (!isPaletteItem && !isEditing) {
      if (isLoadingPrice && !priceData) {
        return (
          <div style={priceContainerStyle}>
            <span style={loadingStyle}>Loading...</span>
          </div>
        );
      }
      
      if (priceData && priceData.propose_gwei > 0) {
        return (
          <div style={priceContainerStyle}>
            <div style={incrementorContainerStyle}>
              <button
                style={incrementorButtonStyle}
                onClick={handleIncrement}
                title="More decimals"
              >
                ▲
              </button>
              <button
                style={incrementorButtonStyle}
                onClick={handleDecrement}
                title="Fewer decimals"
              >
                ▼
              </button>
            </div>
            <div style={priceTextContainerStyle}>
              <span style={priceLabelStyle}>Gas</span>
              <span style={priceValueStyle}>{formatGasPrice(priceData.propose_gwei, decimalPlaces)}</span>
              <div style={{ fontSize: '6px', opacity: 0.7, marginTop: '2px' }}>
                S:{priceData.safe_gwei?.toFixed(1)} | F:{priceData.fast_gwei?.toFixed(1)}
              </div>
            </div>
          </div>
        );
      }
      
      if (priceError) {
        return (
          <div style={priceContainerStyle}>
            <span style={{...loadingStyle, color: '#ff6b6b'}}>Error</span>
          </div>
        );
      }
      
      // If we have no price data yet, show a placeholder with the label
      // but only show the actual label text if it's not the default
      if (!priceData && !isLoadingPrice) {
        const displayText = (editValue && editValue !== 'Gas Node') ? editValue : 'Gas Node';
        return <span>{displayText}</span>;
      }
    }

    if (isEditable && !isPaletteItem) {
      if (isEditing) {
        return (
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
        );
      } else {
        return (
          <span 
            onDoubleClick={handleDoubleClick}
            style={{ cursor: 'text' }}
          >
            {editValue || '\u00A0'}
          </span>
        );
      }
    }

    return (
      <span>{(typeof label === 'string' && label.trim() !== '') ? label : 'Block'}</span>
    );
  };

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
      
      {renderContent()}
    </div>
  );
};

export default GasNode;