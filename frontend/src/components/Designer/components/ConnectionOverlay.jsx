import React, { useEffect, useState, useRef } from 'react';
import { createBezierCurve } from '../utils/geometry';

/**
 * Get the center position of a port element relative to the workspace
 * @param {string} blockId - The block's data-block-id attribute
 * @param {string} portType - 'input', 'output', or custom port type like 'output-0', 'output-1'
 * @param {React.RefObject} workspaceRef - Reference to workspace for coordinate calculation
 * @returns {{x: number, y: number} | null} Port center position or null if not found
 */
const getPortPosition = (blockId, portType, workspaceRef) => {
  const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
  if (!blockElement || !workspaceRef?.current) return null;

  const workspaceRect = workspaceRef.current.getBoundingClientRect();
  
  // Check if this is a SwitchCase row-specific output port (e.g., 'output-0', 'output-1', 'output-default')
  if (portType.startsWith('output-')) {
    // For SwitchCase component: find the specific row's output port
    // The port type format is 'output-{index}' where index is the row number or 'default'
    const indexStr = portType.split('-')[1];
    
    // Find all rows in the SwitchCase component
    // Look for div elements that look like SwitchCase rows
    // They have position: relative and typically height around 28px
    const rows = blockElement.querySelectorAll('div[style*="position: relative"]');
    
    let rowIndex;
    // Handle 'default' case specially - it's the last row
    if (indexStr === 'default') {
      // Default case is the last row
      rowIndex = rows.length > 0 ? rows.length - 1 : 0;
    } else {
      rowIndex = parseInt(indexStr);
    }
    
    // Validate row index
    if (!isNaN(rowIndex) && rows.length > rowIndex && rowIndex >= 0) {
      const row = rows[rowIndex];
      
      // Find the pink output port in this row
      // Look for an element with magenta background color and crosshair cursor
      let outputPort = null;
      
      // Check all elements in the row
      const allElements = row.querySelectorAll('*');
      for (const el of allElements) {
        const bgColor = el.style.backgroundColor;
        const cursor = el.style.cursor;
        // Check for magenta color AND crosshair cursor (output ports have cursor: 'crosshair')
        const isMagenta = bgColor === '#ff00ff' || bgColor === 'rgb(255, 0, 255)' || 
                         bgColor === '#f0f' || (bgColor && bgColor.toLowerCase().includes('ff00ff'));
        const isCrosshair = cursor === 'crosshair';
        
        if (isMagenta && isCrosshair) {
          outputPort = el;
          break;
        }
      }
      
      // Fallback: just look for magenta if crosshair not found
      if (!outputPort) {
        for (const el of allElements) {
          const bgColor = el.style.backgroundColor;
          if (bgColor === '#ff00ff' || bgColor === 'rgb(255, 0, 255)' || 
              bgColor === '#f0f' || (bgColor && bgColor.toLowerCase().includes('ff00ff'))) {
            outputPort = el;
            break;
          }
        }
      }
      
      if (outputPort) {
        const portRect = outputPort.getBoundingClientRect();
        return {
          x: portRect.left + portRect.width / 2 - workspaceRect.left + workspaceRef.current.scrollLeft,
          y: portRect.top + portRect.height / 2 - workspaceRect.top + workspaceRef.current.scrollTop
        };
      } else {
        // Debug logging
        console.warn(`SwitchCase output port not found for block ${blockId}, port ${portType}, row ${rowIndex}`);
      }
    }
    // Fallback to regular output port logic
  }
  
  if (portType === 'output' || portType.startsWith('output')) {
    // Output port is the bottom bar - find the bottom rectangle element
    // It's the first child div in the bottomBarStyle div with magenta color
    const bottomBar = blockElement.querySelector('[style*="bottom: -1px"]');
    if (bottomBar) {
      const portElement = bottomBar.querySelector('div');
      if (portElement) {
        const portRect = portElement.getBoundingClientRect();
        return {
          x: portRect.left + portRect.width / 2 - workspaceRect.left + workspaceRef.current.scrollLeft,
          y: portRect.top + portRect.height / 2 - workspaceRect.top + workspaceRef.current.scrollTop
        };
      }
    }
    // Fallback: calculate from block position
    const blockRect = blockElement.getBoundingClientRect();
    return {
      x: blockRect.left + 20 - workspaceRect.left + workspaceRef.current.scrollLeft, // Left side of block
      y: blockRect.bottom - workspaceRect.top + workspaceRef.current.scrollTop // Bottom of block
    };
  } else {
    // Input port is the top bar - find one of the top rectangle elements
    const topBar = blockElement.querySelector('[style*="top: -1px"]');
    if (topBar) {
      const portElement = topBar.querySelector('div');
      if (portElement) {
        const portRect = portElement.getBoundingClientRect();
        return {
          x: portRect.left + portRect.width / 2 - workspaceRect.left + workspaceRef.current.scrollLeft,
          y: portRect.top + portRect.height / 2 - workspaceRect.top + workspaceRef.current.scrollTop
        };
      }
    }
    // Fallback: calculate from block position
    const blockRect = blockElement.getBoundingClientRect();
    return {
      x: blockRect.left + blockRect.width / 2 - workspaceRect.left + workspaceRef.current.scrollLeft, // Center of block
      y: blockRect.top - workspaceRect.top + workspaceRef.current.scrollTop // Top of block
    };
  }
};

/**
 * SVG overlay component for drawing connections between blocks
 */
const ConnectionOverlay = ({ 
  connections, 
  blocks, 
  activeWire, 
  curveStyle = 'smooth',
  workspaceRef,
  draggedBlockId 
}) => {
  // Force re-render during drag by tracking drag state
  const [renderKey, setRenderKey] = useState(0);
  
  // When a block is being dragged, continuously update to recalculate port positions
  useEffect(() => {
    if (draggedBlockId) {
      // While dragging, update every frame to keep lines connected
      let animationFrame;
      const updatePosition = () => {
        setRenderKey(k => k + 1);
        animationFrame = requestAnimationFrame(updatePosition);
      };
      animationFrame = requestAnimationFrame(updatePosition);
      
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
  }, [draggedBlockId]);
  
  // Also re-render when blocks change (position updates)
  useEffect(() => {
    setRenderKey(k => k + 1);
  }, [blocks]);

  return (
    <svg 
      className="wire-overlay" 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', // Allow clicks to pass through to blocks
        zIndex: 5
      }}
    >
      <defs>
        <linearGradient id="gradient-main" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="gradient-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
        </linearGradient>
      </defs>
      
      {/* Draw established connection paths by dynamically calculating port positions */}
      {connections.map((conn) => {
        const sourceBlock = blocks.find(b => b.id === conn.sourceId);
        const targetBlock = blocks.find(b => b.id === conn.targetId);

        if (!sourceBlock || !targetBlock) {
          return null;
        }

        // Dynamically calculate port positions from DOM
        const sourcePort = getPortPosition(conn.sourceId, conn.sourcePort || 'output', workspaceRef);
        const targetPort = getPortPosition(conn.targetId, conn.targetPort || 'input', workspaceRef);

        if (!sourcePort || !targetPort) {
          // Fallback to block positions if port elements not found
          const sourceX = sourceBlock.position?.x || 0;
          const sourceY = (sourceBlock.position?.y || 0) + 40; // Approximate block height
          const targetX = targetBlock.position?.x || 0;
          const targetY = targetBlock.position?.y || 0;
          
          return (
            <path
              key={conn.id}
              d={createBezierCurve(sourceX, sourceY, targetX, targetY, curveStyle)}
              stroke="url(#gradient-main)"
              strokeWidth="2"
              fill="none"
              className="connection-line-drawing"
            />
          );
        }

        return (
          <path
            key={conn.id}
            d={createBezierCurve(sourcePort.x, sourcePort.y, targetPort.x, targetPort.y, curveStyle)}
            stroke="url(#gradient-main)"
            strokeWidth="2"
            fill="none"
            className="connection-line-drawing"
          />
        );
      })}

      {/* Draw the "Rubber Band" wire while the user is actively dragging one */}
      {activeWire && (
        <path
          d={`M ${activeWire.startX} ${activeWire.startY} L ${activeWire.currentX} ${activeWire.currentY}`}
          stroke="url(#gradient-highlight)"
          strokeWidth="2"
          fill="none"
          className="connection-line-drawing"
        />
      )}
    </svg>
  );
};

export default ConnectionOverlay;