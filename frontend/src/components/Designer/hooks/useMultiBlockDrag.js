import { useState, useCallback } from 'react';

/**
 * Custom hook for handling multi-block dragging functionality
 * Extends the existing useBlockDrag functionality
 */
export const useMultiBlockDrag = (blocks, updateBlockPosition, selectedBlockIds) => {
  const [draggedBlockId, setDraggedBlockId] = useState(null);
  const [isDraggingMultiple, setIsDraggingMultiple] = useState(false);
  const [dragOffsets, setDragOffsets] = useState([]);

  /**
   * Start dragging a block or multiple blocks
   */
  const startDrag = useCallback((blockId, e, workspaceRef) => {
    if (!workspaceRef?.current || !e) return;

    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    const initialMouseX = e.clientX - workspaceRect.left + workspaceRef.current.scrollLeft;
    const initialMouseY = e.clientY - workspaceRect.top + workspaceRef.current.scrollTop;

    // Check if we're dragging multiple blocks
    const isMultiDrag = selectedBlockIds.has(blockId) && selectedBlockIds.size > 1;
    
    if (isMultiDrag) {
      // Calculate offsets for all selected blocks
      const offsets = Array.from(selectedBlockIds).map(id => {
        const selectedBlock = blocks.find(b => b.id === id);
        if (!selectedBlock) return null;
        
        return {
          blockId: id,
          offsetX: initialMouseX - selectedBlock.position.x,
          offsetY: initialMouseY - selectedBlock.position.y
        };
      }).filter(Boolean);

      setDragOffsets(offsets);
      setIsDraggingMultiple(true);
    } else {
      // Single block drag
      const grabOffsetX = initialMouseX - block.position.x;
      const grabOffsetY = initialMouseY - block.position.y;
      
      setDragOffsets([{
        blockId,
        offsetX: grabOffsetX,
        offsetY: grabOffsetY
      }]);
      setIsDraggingMultiple(false);
    }

    setDraggedBlockId(blockId);

    const handleMouseMove = (moveEvent) => {
      const mouseX = moveEvent.clientX - workspaceRect.left + workspaceRef.current.scrollLeft;
      const mouseY = moveEvent.clientY - workspaceRect.top + workspaceRef.current.scrollTop;
      
      // Update positions for all dragged blocks
      dragOffsets.forEach(offset => {
        if (!offset) return;
        
        const x = mouseX - offset.offsetX;
        const y = mouseY - offset.offsetY;
        
        updateBlockPosition(offset.blockId, { x, y });
      });
    };

    // Detach listeners when user releases mouse
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setDraggedBlockId(null);
      setIsDraggingMultiple(false);
      setDragOffsets([]);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [blocks, updateBlockPosition, selectedBlockIds, dragOffsets]);

  /**
   * Handle drop from external palette (same as original)
   */
  const handlePaletteDrop = useCallback((e, blockData, workspaceRef) => {
    if (!workspaceRef?.current) return;

    const workspaceElement = workspaceRef.current;
    const workspaceRect = workspaceElement.getBoundingClientRect();
    
    // Boundary check to ensure drop happened inside workspace
    if (
      e.clientX < workspaceRect.left || 
      e.clientX > workspaceRect.right || 
      e.clientY < workspaceRect.top || 
      e.clientY > workspaceRect.bottom
    ) return; 

    // Adjust coordinates for scroll position and workspace offset
    const workspaceScrollLeft = workspaceElement.scrollLeft;
    const workspaceScrollTop = workspaceElement.scrollTop;
    
    const mouseX = e.clientX - workspaceRect.left + workspaceScrollLeft;
    const mouseY = e.clientY - workspaceRect.top + workspaceScrollTop;
    
    // Offset so the block is placed centrally under the cursor
    const x = mouseX - 50; 
    const y = mouseY - 25; 
    
    const label = blockData.title || blockData.label || 'Untitled Block';
    
    // Categorization logic to determine visual style of the block
    const blockType = blockData.category?.toLowerCase().includes('blockchain') || 
                     blockData.category?.toLowerCase().includes('data provider') ||
                     blockData.category?.toLowerCase().includes('strategy') ||
                     blockData.category?.toLowerCase().includes('risk') ||
                     blockData.category?.toLowerCase().includes('alpha') ||
                     blockData.category?.toLowerCase().includes('ai') ||
                     blockData.category?.toLowerCase().includes('execution') ||
                     blockData.category?.toLowerCase().includes('dashboard') ||
                     blockData.category?.toLowerCase().includes('ai-native') ? 'blockchain' : 'default';
    
    const newBlock = { 
      ...blockData, 
      id: `${blockData.id}-${Date.now()}`, // Ensure unique ID for multiple instances
      label,
      type: blockType,
      position: { x, y }
    };
    
    return newBlock;
  }, []);

  /**
   * Handle drop event in workspace
   */
  const handleDrop = useCallback((e, workspaceRef, addBlock) => {
    e.preventDefault();

    const paletteData = e.dataTransfer.getData('application/x-palette-block');
    if (paletteData) {
      try {
        const blockData = JSON.parse(paletteData);
        const newBlock = handlePaletteDrop(e, blockData, workspaceRef);
        if (newBlock) {
          addBlock(newBlock);
        }
      } catch (err) {
        console.error('Failed to parse palette block data', err);
      }
      return;
    }

    // Handles terminal repositioning if block drag wasn't using the mousemove listener
    if (draggedBlockId && workspaceRef?.current) {
      const draggedBlockIndex = blocks.findIndex(b => b.id === draggedBlockId);
      if (draggedBlockIndex !== -1) {
        const workspaceElement = workspaceRef.current;
        const workspaceRect = workspaceElement.getBoundingClientRect();
        const workspaceScrollLeft = workspaceElement.scrollLeft;
        const workspaceScrollTop = workspaceElement.scrollTop;
        
        const mouseX = e.clientX - workspaceRect.left + workspaceScrollLeft;
        const mouseY = e.clientY - workspaceRect.top + workspaceScrollTop;
        
        const x = mouseX - 50;
        const y = mouseY - 25;
        
        updateBlockPosition(draggedBlockId, { x, y });
      }
      setDraggedBlockId(null);
      setIsDraggingMultiple(false);
      setDragOffsets([]);
      return;
    }

    setDraggedBlockId(null);
    setIsDraggingMultiple(false);
    setDragOffsets([]);
  }, [draggedBlockId, blocks, updateBlockPosition, handlePaletteDrop]);

  /**
   * Reset drag state
   */
  const resetDrag = useCallback(() => {
    setDraggedBlockId(null);
    setIsDraggingMultiple(false);
    setDragOffsets([]);
  }, []);

  return {
    draggedBlockId,
    isDraggingMultiple,
    startDrag,
    handleDrop,
    resetDrag,
    handlePaletteDrop
  };
};