import { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addConnection, 
  removeConnection, 
  removeConnectionById, 
  setConnections as setReduxConnections, 
  clearAllConnections as clearReduxConnections,
  selectConnectionSummary
} from '../../../redux/slices/connectionsSlice';

/**
 * Custom hook for managing flow connections between blocks
 */
export const useFlowConnections = (blocks) => {
  const dispatch = useDispatch();
  const [connections, setLocalConnections] = useState([]);
  const [activeWire, setActiveWire] = useState(null);
  const [curveStyle, setCurveStyle] = useState('smooth');
  
  // Get connection summary from Redux
  const connectionSummary = useSelector(selectConnectionSummary);
  const prevConnectionCount = useRef(0);
  
  // Sync local connections with Redux state
  useEffect(() => {
    setLocalConnections(connectionSummary.connections.map(conn => ({
      id: conn.id,
      sourceId: conn.source,
      targetId: conn.target,
      sourcePort: conn.sourcePort,
      targetPort: conn.targetPort
    })));
  }, [connectionSummary.connections]);
  
  // Log when multiple blocks are connected
  useEffect(() => {
    const currentCount = connectionSummary.totalConnections;
    
    // Only log when a new connection is added and there are multiple connections
    if (currentCount > prevConnectionCount.current && currentCount >= 1) {
      if (currentCount === 1) {
        // Single connection
        console.log('🔗 Blocks connected:', connectionSummary.summary);
      } else {
        // Multiple connections - show all
        console.log('🔗 Multiple blocks connected:', connectionSummary.summary);
      }
    }
    
    prevConnectionCount.current = currentCount;
  }, [connectionSummary]);

  /**
   * Check if an element has a valid input port color (teal, green, or cyan)
   * Supports both hex (#64ffda, #00ff00, #56B6C2) and rgb formats
   */
  const isInputPortColor = (color) => {
    if (!color) return false;
    
    // Check for hex colors
    if (color === '#64ffda' || color === '#00ff00' || color === '#56B6C2') {
      return true;
    }
    
    // Check for rgb colors
    if (color === 'rgb(100, 255, 218)' || color === 'rgb(0, 255, 0)' || color === 'rgb(86, 182, 194)') {
      return true;
    }
    
    // Check for rgba colors (with transparency)
    if (color.startsWith('rgba')) {
      const rgbMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        // Check for teal (100, 255, 218), green (0, 255, 0), or cyan (86, 182, 194)
        return (r === 100 && g === 255 && b === 218) || 
               (r === 0 && g === 255 && b === 0) || 
               (r === 86 && g === 182 && b === 194);
      }
    }
    
    return false;
  };

  /**
   * Get block element and its position from DOM
   */
  const getBlockElementAndPosition = (blockId) => {
    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
    if (!blockElement) return null;
    
    const rect = blockElement.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(blockElement);
    
    // Parse position from inline styles or computed styles
    let x = parseInt(blockElement.style.left) || 0;
    let y = parseInt(blockElement.style.top) || 0;
    
    // If inline styles aren't set, try to get from transform
    if (x === 0 && y === 0) {
      const transform = computedStyle.transform;
      if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
          const values = matrix[1].split(',').map(parseFloat);
          if (values.length >= 6) {
            x = values[4];
            y = values[5];
          }
        }
      }
    }
    
    return { element: blockElement, position: { x, y }, rect };
  };

  /**
   * Calculate offset from block position to connection point
   */
  const calculateConnectionOffset = (blockId, connectionPointX, connectionPointY, workspaceRef) => {
    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
    if (!blockElement || !workspaceRef?.current) return { x: 0, y: 0 };
    
    const workspaceElement = workspaceRef.current;
    const workspaceRect = workspaceElement.getBoundingClientRect();
    
    // Get block position from DOM
    const blockRect = blockElement.getBoundingClientRect();
    const blockX = blockRect.left - workspaceRect.left + workspaceElement.scrollLeft;
    const blockY = blockRect.top - workspaceRect.top + workspaceElement.scrollTop;
    
    // Calculate offset: connection point minus block position
    const offsetX = connectionPointX - blockX;
    const offsetY = connectionPointY - blockY;
    
    return { x: offsetX, y: offsetY };
  };

  /**
   * Start a new connection from a source port
   */
  const startConnection = useCallback((blockId, portType, e, workspaceRef) => {
    if (!workspaceRef?.current) return;
    
    const workspaceElement = workspaceRef.current;
    const workspaceRect = workspaceElement.getBoundingClientRect();
    const connectionPointElement = e.target;
    const connectionRect = connectionPointElement.getBoundingClientRect();
    
    // Calculate precise start center point of the port (absolute coordinates within workspace)
    const startX = connectionRect.left + connectionRect.width / 2 - workspaceRect.left + workspaceElement.scrollLeft;
    const startY = connectionRect.top + connectionRect.height / 2 - workspaceRect.top + workspaceElement.scrollTop;
    
    setActiveWire({
      sourceId: blockId,
      sourcePort: portType,
      startX,
      startY,
      currentX: startX,
      currentY: startY
    });

    const handleMouseMove = (moveEvent) => {
      setActiveWire(prev => {
        if (!prev) return null;
        return {
          ...prev,
          currentX: moveEvent.clientX - workspaceRect.left + workspaceElement.scrollLeft,
          currentY: moveEvent.clientY - workspaceRect.top + workspaceElement.scrollTop
        };
      });

      // Visual feedback: find if we are hovering over a valid input port
      const hoverElement = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      
      // Remove hover class from all potential input port elements
      document.querySelectorAll('.connection-hover').forEach(el => {
        el.classList.remove('connection-hover');
      });
      
      if (hoverElement) {
        // Check if the hovered element has input port color OR data-input-port attribute
        const bgColor = hoverElement.style.backgroundColor;
        const hasInputPortAttr = hoverElement.getAttribute?.('data-input-port') === 'true' || 
                                hoverElement.closest('[data-input-port="true"]');
        if (isInputPortColor(bgColor) || hasInputPortAttr) {
          hoverElement.classList.add('connection-hover');
        }
      }
    };

    const handleMouseUp = (upEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      const targetElement = document.elementFromPoint(upEvent.clientX, upEvent.clientY);

      if (targetElement) {
        // Check if the target element has input port color OR data-input-port attribute
        const bgColor = targetElement.style.backgroundColor;
        const hasInputPortAttr = targetElement.getAttribute?.('data-input-port') === 'true' || 
                                targetElement.closest('[data-input-port="true"]');
        
        if (isInputPortColor(bgColor) || hasInputPortAttr) {
          const targetBlockId = targetElement.closest('[data-block-id]')?.getAttribute('data-block-id') ||
                                targetElement.closest('.live-order-book-draggable-box')?.id ||
                                targetElement.closest('.data-view-draggable-box')?.id ||
                                targetElement.closest('.draggable-block')?.getAttribute('data-block-id');

          if (targetBlockId && targetBlockId !== blockId) {
            const targetRect = targetElement.getBoundingClientRect();
            const workspaceRect = workspaceRef.current.getBoundingClientRect();
            
            const targetX = targetRect.left + targetRect.width / 2 - workspaceRect.left + workspaceRef.current.scrollLeft;
            const targetY = targetRect.top + targetRect.height / 2 - workspaceRect.top + workspaceRef.current.scrollTop;

            // Calculate offsets from block positions
            const sourceOffset = calculateConnectionOffset(blockId, startX, startY, workspaceRef);
            const targetOffset = calculateConnectionOffset(targetBlockId, targetX, targetY, workspaceRef);

            const newConnection = {
              id: `conn-${Date.now()}`,
              sourceId: blockId,
              targetId: targetBlockId,
              sourcePort: portType, // Preserve the actual port type (e.g., 'output-0', 'output-1')
              targetPort: 'input',
              // Store relative offsets from block positions
              sourceOffset,
              targetOffset
            };
            
            setLocalConnections(prev => [...prev, newConnection]);
            // Dispatch to Redux store
            dispatch(addConnection(newConnection));
          }
        }
      }

      // Remove hover class from all elements
      document.querySelectorAll('.connection-hover').forEach(el => {
        el.classList.remove('connection-hover');
      });

      setActiveWire(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

/**
   * Update connection positions when blocks move
   */
  const updateConnectionPositions = useCallback((movedBlockId, newPosition, allBlocks) => {
    setLocalConnections(prev => prev.map(conn => {
      // Update connections where the moved block is either source or target
      if (conn.sourceId === movedBlockId || conn.targetId === movedBlockId) {
        // Force re-render by updating the connection object
        // This ensures ConnectionOverlay recalculates positions immediately
        return { ...conn, updatedAt: Date.now() };
      }
      return conn;
    }));
  }, []);

  /**
   * Get absolute coordinates for a connection
   */
  const getConnectionCoordinates = useCallback((conn) => {
    const sourceBlock = blocks.find(b => b.id === conn.sourceId);
    const targetBlock = blocks.find(b => b.id === conn.targetId);
    
    if (!sourceBlock || !targetBlock) {
      return { sourceX: 0, sourceY: 0, targetX: 0, targetY: 0 };
    }
    
    // Calculate absolute coordinates from block positions + offsets
    const sourceX = sourceBlock.position.x + (conn.sourceOffset?.x || 0);
    const sourceY = sourceBlock.position.y + (conn.sourceOffset?.y || 0);
    const targetX = targetBlock.position.x + (conn.targetOffset?.x || 0);
    const targetY = targetBlock.position.y + (conn.targetOffset?.y || 0);
    
    return { sourceX, sourceY, targetX, targetY };
  }, [blocks]);

  /**
   * Delete a connection between blocks
   */
  const deleteConnection = useCallback((sourceId, targetId) => {
    setLocalConnections(prev => prev.filter(conn => 
      !(conn.sourceId === sourceId && conn.targetId === targetId)
    ));
    // Dispatch to Redux store
    dispatch(removeConnection({ sourceId, targetId }));
  }, [dispatch]);

  /**
   * Delete connection by ID
   */
  const deleteConnectionById = useCallback((connectionId) => {
    setLocalConnections(prev => prev.filter(conn => conn.id !== connectionId));
    // Dispatch to Redux store
    dispatch(removeConnectionById(connectionId));
  }, [dispatch]);

  /**
   * Get connections for a specific block
   */
  const getBlockConnections = useCallback((blockId) => {
    return connections.filter(conn => 
      conn.sourceId === blockId || conn.targetId === blockId
    );
  }, [connections]);

  /**
   * Check if a block is connected
   */
  const isBlockConnected = useCallback((blockId) => {
    return connections.some(conn => 
      conn.sourceId === blockId || conn.targetId === blockId
    );
  }, [connections]);

  /**
   * Clear all connections
   */
  const clearAllConnections = useCallback(() => {
    setLocalConnections([]);
    // Dispatch to Redux store
    dispatch(clearReduxConnections());
  }, [dispatch]);

  // Wrapper for setConnections to maintain API compatibility
  const handleSetConnections = useCallback((newConnections) => {
    setLocalConnections(newConnections);
    // Dispatch to Redux store
    dispatch(setReduxConnections(newConnections));
  }, [dispatch]);

  return {
    connections,
    setConnections: handleSetConnections,
    activeWire,
    curveStyle,
    setCurveStyle,
    startConnection,
    deleteConnection,
    deleteConnectionById,
    updateConnectionPositions,
    getConnectionCoordinates,
    getBlockConnections,
    isBlockConnected,
    clearAllConnections
  };
};