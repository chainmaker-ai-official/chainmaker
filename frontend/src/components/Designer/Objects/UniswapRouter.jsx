import React, { useState, useEffect, useRef, useCallback } from 'react';

const UniswapRouter = ({ 
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
  const [lastSuccessfulPriceData, setLastSuccessfulPriceData] = useState(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [connectionStatus, setConnectionStatus] = useState('idle'); // 'idle', 'connecting', 'connected', 'error', 'timeout'
  const [timeoutDuration, setTimeoutDuration] = useState(10000); // Default 10 seconds
  const [showTimeoutConfig, setShowTimeoutConfig] = useState(false);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Get backend URL from environment
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

  // Function to fetch price with timeout
  const fetchPriceWithTimeout = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsLoadingPrice(true);
    setPriceError(null);
    setConnectionStatus('connecting');
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timeout after ${timeoutDuration/1000} seconds`));
        }, timeoutDuration);
      });

      // Create the fetch promise
      const fetchPromise = fetch(`${backendUrl}/api/uniswap/price`, { signal });
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPriceData(data);
      setLastSuccessfulPriceData(data);
      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('Failed to fetch ETH price:', error);
      setPriceError(error.message);
      
      if (error.name === 'AbortError') {
        setConnectionStatus('idle');
      } else if (error.message.includes('timeout')) {
        setConnectionStatus('timeout');
      } else {
        setConnectionStatus('error');
      }
    } finally {
      setIsLoadingPrice(false);
    }
  }, [backendUrl, timeoutDuration]);

  // Manual retry function
  const handleManualRetry = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!isPaletteItem && !isEditing) {
      fetchPriceWithTimeout();
    }
  }, [fetchPriceWithTimeout, isPaletteItem, isEditing]);

  // Fetch price ONLY when THIS UniswapRouter receives a Bang trigger
  // inputData is set by BlockRenderer from bangTriggers[block.id] - contains timestamp for each Bang click
  useEffect(() => {
    // Only fetch when inputData is present (meaning a Bang was triggered for this specific block)
    if (isPaletteItem || isEditing || !inputData) return;

    // Fetch immediately when Bang is triggered for this specific block
    fetchPriceWithTimeout();
  }, [backendUrl, isPaletteItem, isEditing, inputData?.timestamp, fetchPriceWithTimeout]); // Use timestamp to trigger on every Bang click

  // Output price data to connected blocks when price is fetched/updated
  useEffect(() => {
    if (priceData && onPriceUpdate) {
      // Output raw price value without transformation
      onPriceUpdate(id, {
        value: priceData.eth_price,
        raw: priceData,
        type: 'price'
      });
    }
  }, [priceData, onPriceUpdate, id]);

  // Auto-enter edit mode when block is new and editable
  useEffect(() => {
    if (isNew && isEditable && !isPaletteItem) {
      setIsEditing(true);
      setEditValue('');
      setHasUserTyped(false);
      // Focus the input after a small delay to ensure it's rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Select all text to make it2 of text easy to replace
          inputRef.current.select();
        }
      }, 0);
    }
  }, [isNew, isEditable, isPaletteItem]);

  const rectangleColor = type === 'blockchain' ? '#64ffda' : '#00ff00';
  
  // Calculate dynamic width based on decimal places - expands to the right
  const calculateBlockWidth = () => {
    const baseWidth = 80;
    const decimalWidth = decimalPlaces > 2 ? (decimalPlaces - 2) * 7 : 0;
    
    if (isEditing) {
      const textLength = editValue.length;
      return Math.max(baseWidth, baseWidth + (textLength * 8));
    } else if (priceData && priceData.eth_price > 0) {
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

  // Format price for display
  const formatPrice = (price, decimals = 2) => {
    if (!price || price === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(price);
  };

  // Format timestamp with milliseconds
  const formatTimestampWithMs = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
      return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid time';
    }
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

  // Handle timeout configuration change
  const handleTimeoutChange = (newTimeout) => {
    setTimeoutDuration(newTimeout);
    setShowTimeoutConfig(false);
  };

  // Get status message for tooltip
  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'idle': return 'Ready to fetch';
      case 'connecting': return 'Connecting to backend...';
      case 'connected': return `Connected - ${lastSuccessfulPriceData ? `Last updated: ${new Date(lastSuccessfulPriceData.timestamp).toLocaleTimeString()}` : 'Price fetched'}`;
      case 'timeout': return `Timeout after ${timeoutDuration/1000}s - Click to retry`;
      case 'error': return `Error: ${priceError || 'Connection failed'} - Click to retry`;
      default: return 'Unknown status';
    }
  };

  // Get light color based on status
  const getLightColor = () => {
    switch (connectionStatus) {
      case 'connected': return type === 'blockchain' ? '#64ffda' : '#00ff00'; // Teal for blockchain, green for default
      case 'connecting': return '#ffff00';
      case 'timeout':
      case 'error': return '#ff0000';
      default: return '#888888';
    }
  };

  const renderContent = () => {
    if (!isPaletteItem && !isEditing) {
      // Determine which price data to show (current or last successful)
      const displayPriceData = priceData || lastSuccessfulPriceData;
      const isStaleData = !priceData && lastSuccessfulPriceData;
      
      if (isLoadingPrice && !priceData) {
        return (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'}}>
            <div style={priceContainerStyle}>
              <span style={loadingStyle}>Loading...</span>
            </div>
            <div style={{fontSize: '7px', opacity: 0.6, color: type === 'blockchain' ? '#64ffda' : '#00ff00'}}>
              Timeout: {timeoutDuration/1000}s
            </div>
          </div>
        );
      }
      
      if (displayPriceData && displayPriceData.eth_price > 0) {
        return (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'}}>
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
                <span style={priceLabelStyle}>ETH {isStaleData && <span style={{color: '#ff0000', fontSize: '6px'}}>⏱</span>}</span>
                <span style={{
                  ...priceValueStyle,
                  opacity: isStaleData ? 0.7 : 1,
                  color: isStaleData ? '#ff0000' : priceValueStyle.color
                }}>
                  {formatPrice(displayPriceData.eth_price, decimalPlaces)}
                </span>
              </div>
            </div>
            
            {/* Status information inside the node */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1px',
              fontSize: '6px',
              opacity: 0.7
            }}>
              {isStaleData ? (
                <>
                  <span style={{color: '#ff0000'}}>STALE DATA</span>
                  <span style={{color: type === 'blockchain' ? '#64ffda' : '#00ff00'}}>
                    Last: {lastSuccessfulPriceData ? formatTimestampWithMs(lastSuccessfulPriceData.timestamp) : 'N/A'}
                  </span>
                </>
              ) : connectionStatus === 'connected' ? (
                <>
                  <span style={{color: type === 'blockchain' ? '#64ffda' : '#00ff00'}}>CONNECTED</span>
                  <span style={{color: type === 'blockchain' ? '#64ffda' : '#00ff00'}}>
                    {formatTimestampWithMs(displayPriceData.timestamp)}
                  </span>
                </>
              ) : connectionStatus === 'error' || connectionStatus === 'timeout' ? (
                <>
                  <span style={{color: '#ff0000'}}>{connectionStatus.toUpperCase()}</span>
                  <span style={{color: '#ff0000'}}>Click light to retry</span>
                </>
              ) : null}
              
              {/* Always show timeout setting */}
              <span style={{color: type === 'blockchain' ? '#64ffda' : '#00ff00', marginTop: '1px'}}>
                Timeout: {timeoutDuration/1000}s
              </span>
            </div>
          </div>
        );
      }
      
      // Show error state or "No data" message with status info
      if (priceError || !displayPriceData) {
        return (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'}}>
            <div style={priceContainerStyle}>
              <span style={{...loadingStyle, color: '#ff6b6b'}}>
                {priceError ? 'Connection Error' : 'No Data'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1px',
              fontSize: '6px',
              opacity: 0.7
            }}>
              <span style={{color: '#ff0000'}}>{connectionStatus.toUpperCase()}</span>
              <span style={{color: '#ff0000'}}>Click light to retry</span>
              <span style={{color: type === 'blockchain' ? '#64ffda' : '#00ff00', marginTop: '1px'}}>
                Timeout: {timeoutDuration/1000}s
              </span>
            </div>
          </div>
        );
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

    // Only show label for palette items or when nothing else applies
    return (
      <span>{(typeof label === 'string' && label.trim() !== '') ? label : 'Uniswap'}</span>
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
      {/* Add CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
      
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
      
      {/* Clickable Light Indicator */}
      {!isPaletteItem && (
        <div 
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            zIndex: 10
          }}
        >
          {/* Main Light */}
          <div 
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: getLightColor(),
              cursor: 'pointer',
              boxShadow: connectionStatus === 'connecting' ? `0 0 4px ${getLightColor()}, 0 0 6px ${getLightColor()}` : 'none',
              animation: connectionStatus === 'connecting' ? 'pulse 1s infinite' : 'none',
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
            }}
            onClick={handleManualRetry}
            title={getStatusMessage()}
          />
          
          {/* Timeout Configuration */}
          {showTimeoutConfig && !isPaletteItem && (
            <div 
              style={{
                position: 'absolute',
                top: '12px',
                right: '0',
                background: type === 'blockchain' ? '#0a1929' : '#0a0a0a',
                border: `1px solid ${type === 'blockchain' ? '#1e4976' : '#333333'}`,
                borderRadius: '3px',
                padding: '6px',
                minWidth: '120px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                zIndex: 20
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '9px', marginBottom: '4px', color: type === 'blockchain' ? '#64ffda' : '#00ff00' }}>
                Timeout: {timeoutDuration/1000}s
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[5000, 10000, 15000, 30000, 60000].map((timeout) => (
                  <button
                    key={timeout}
                    style={{
                      background: timeoutDuration === timeout ? (type === 'blockchain' ? '#1e4976' : '#333333') : 'transparent',
                      border: `1px solid ${type === 'blockchain' ? '#64ffda' : '#00ff00'}`,
                      color: type === 'blockchain' ? '#64ffda' : '#00ff00',
                      fontSize: '8px',
                      padding: '2px 4px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onClick={() => handleTimeoutChange(timeout)}
                  >
                    {timeout/1000} seconds
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Gear Icon for Timeout Config */}
          {!isPaletteItem && (
            <div 
              style={{
                width: '6px',
                height: '6px',
                fontSize: '6px',
                color: type === 'blockchain' ? '#64ffda' : '#00ff00',
                cursor: 'pointer',
                opacity: 0.7,
                marginTop: '2px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowTimeoutConfig(!showTimeoutConfig);
              }}
              title="Configure timeout"
            >
              ⚙
            </div>
          )}
        </div>
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

export default UniswapRouter;