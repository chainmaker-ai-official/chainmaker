import React, { useState, useCallback, useEffect } from 'react';
import ConnectionOverlay from './ConnectionOverlay';
import BlockRenderer from './BlockRenderer';

/**
 * Main workspace container component
 */
const Workspace = ({
  blocks,
  connections,
  activeWire,
  curveStyle,
  draggedBlockId,
  newBlockIds,
  deletingBlockIds,
  onDragStart,
  onDrop,
  onDelete,
  onConnectionStart,
  onConnectionEnd,
  onWorkspaceClick,
  workspaceRef,
  onLabelChange,
  children,
  // New props for selection
  selectedBlockIds,
  isBlockSelected,
  selectionRect,
  isSelecting,
  onSelectionStart,
  onSelectionUpdate,
  onSelectionEnd,
  onBlockClick
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseStartPos, setMouseStartPos] = useState({ x: 0, y: 0 });

  /**
   * Handle mouse down for selection
   */
  const handleMouseDown = useCallback((e) => {
    // Only handle Shift+drag for selection
    if (e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      
      if (!workspaceRef?.current) return;
      
      const workspaceRect = workspaceRef.current.getBoundingClientRect();
      const workspaceScrollLeft = workspaceRef.current.scrollLeft;
      const workspaceScrollTop = workspaceRef.current.scrollTop;
      
      const startX = e.clientX - workspaceRect.left + workspaceScrollLeft;
      const startY = e.clientY - workspaceRect.top + workspaceScrollTop;
      
      setMouseStartPos({ x: startX, y: startY });
      setIsMouseDown(true);
      
      // Start selection
      if (onSelectionStart) {
        onSelectionStart(startX, startY);
      }
    }
  }, [workspaceRef, onSelectionStart]);

  /**
   * Handle mouse move for selection
   */
  const handleMouseMove = useCallback((e) => {
    if (!isMouseDown || !workspaceRef?.current) return;
    
    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    const workspaceScrollLeft = workspaceRef.current.scrollLeft;
    const workspaceScrollTop = workspaceRef.current.scrollTop;
    
    const currentX = e.clientX - workspaceRect.left + workspaceScrollLeft;
    const currentY = e.clientY - workspaceRect.top + workspaceScrollTop;
    
    // Update selection rectangle
    if (onSelectionUpdate) {
      onSelectionUpdate(currentX, currentY, mouseStartPos.x, mouseStartPos.y);
    }
  }, [isMouseDown, workspaceRef, mouseStartPos, onSelectionUpdate]);

  /**
   * Handle mouse up for selection
   */
  const handleMouseUp = useCallback((e) => {
    if (!isMouseDown) return;
    
    setIsMouseDown(false);
    
    if (onSelectionEnd) {
      onSelectionEnd(blocks);
    }
  }, [isMouseDown, onSelectionEnd, blocks]);

  // Add event listeners for mouse move/up
  useEffect(() => {
    if (isMouseDown) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isMouseDown, handleMouseMove, handleMouseUp]);

  /**
   * Handle click on workspace
   */
  const handleClick = useCallback((e) => {
    // Only handle regular clicks (not Shift+drag)
    if (!e.shiftKey) {
      if (onWorkspaceClick) {
        onWorkspaceClick(e);
      }
    }
  }, [onWorkspaceClick]);

  /**
   * Render selection rectangle
   */
  const renderSelectionRect = () => {
    if (!selectionRect || !isSelecting) return null;
    
    const rectStyle = {
      position: 'absolute',
      left: `${selectionRect.x}px`,
      top: `${selectionRect.y}px`,
      width: `${selectionRect.width}px`,
      height: `${selectionRect.height}px`,
      border: '1px dashed #4a9eff',
      backgroundColor: 'rgba(74, 158, 255, 0.1)',
      pointerEvents: 'none',
      zIndex: 1000
    };
    
    return <div style={rectStyle} />;
  };

  return (
    <div 
      className="workspace"
      ref={workspaceRef}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={onDrop}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      <ConnectionOverlay 
        connections={connections}
        blocks={blocks}
        activeWire={activeWire}
        curveStyle={curveStyle}
        workspaceRef={workspaceRef}
        draggedBlockId={draggedBlockId}
      />
      
      {/* Render all blocks */}
      {blocks.map(block => (
        <BlockRenderer
          key={block.id}
          block={block}
          connections={connections}
          draggedBlockId={draggedBlockId}
          newBlockIds={newBlockIds}
          deletingBlockIds={deletingBlockIds}
          onDragStart={onDragStart}
          onDelete={onDelete}
          onConnectionStart={onConnectionStart}
          onConnectionEnd={onConnectionEnd}
          onLabelChange={onLabelChange}
          onBlockClick={onBlockClick}
          // Pass selection state
          isSelected={isBlockSelected ? isBlockSelected(block.id) : (selectedBlockIds ? selectedBlockIds.has(block.id) : false)}
        />
      ))}
      
      {/* Selection rectangle */}
      {renderSelectionRect()}
      
      {/* Additional children (if any) */}
      {children}
    </div>
  );
};

export default Workspace;