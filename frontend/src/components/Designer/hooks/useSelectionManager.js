import { useState, useCallback } from 'react';

/**
 * Custom hook for managing block selection in the designer
 */
export const useSelectionManager = () => {
  const [selectedBlockIds, setSelectedBlockIds] = useState(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null);

  /**
   * Select a single block
   */
  const selectBlock = useCallback((blockId, addToSelection = false) => {
    setSelectedBlockIds(prev => {
      if (addToSelection) {
        // Toggle selection if block is already selected
        const newSet = new Set(prev);
        if (newSet.has(blockId)) {
          newSet.delete(blockId);
        } else {
          newSet.add(blockId);
        }
        return newSet;
      } else {
        // Replace selection with single block
        return new Set([blockId]);
      }
    });
  }, []);

  /**
   * Select multiple blocks
   */
  const selectBlocks = useCallback((blockIds, addToSelection = false) => {
    setSelectedBlockIds(prev => {
      if (addToSelection) {
        // Add to existing selection
        const newSet = new Set(prev);
        blockIds.forEach(id => newSet.add(id));
        return newSet;
      } else {
        // Replace selection with new blocks
        return new Set(blockIds);
      }
    });
  }, []);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelectedBlockIds(new Set());
  }, []);

  /**
   * Toggle block selection
   */
  const toggleBlockSelection = useCallback((blockId) => {
    setSelectedBlockIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  }, []);

  /**
   * Start marquee selection
   */
  const startMarqueeSelection = useCallback((startX, startY) => {
    setIsSelecting(true);
    setSelectionRect({
      x: startX,
      y: startY,
      width: 0,
      height: 0
    });
  }, []);

  /**
   * Update marquee selection rectangle
   */
  const updateMarqueeSelection = useCallback((currentX, currentY, startX, startY) => {
    if (!isSelecting) return;

    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    setSelectionRect({ x, y, width, height });
  }, [isSelecting]);

  /**
   * End marquee selection and select blocks within rectangle
   */
  const endMarqueeSelection = useCallback((blocks, addToSelection = false) => {
    if (!isSelecting || !selectionRect) {
      setIsSelecting(false);
      setSelectionRect(null);
      return;
    }

    // Find blocks that intersect with selection rectangle
    const selectedIds = [];
    blocks.forEach(block => {
      const blockRect = {
        x: block.position.x,
        y: block.position.y,
        width: 100, // Approximate block width
        height: 60  // Approximate block height
      };

      // Check for rectangle intersection
      const intersects = 
        blockRect.x < selectionRect.x + selectionRect.width &&
        blockRect.x + blockRect.width > selectionRect.x &&
        blockRect.y < selectionRect.y + selectionRect.height &&
        blockRect.y + blockRect.height > selectionRect.y;

      if (intersects) {
        selectedIds.push(block.id);
      }
    });

    // Update selection
    if (selectedIds.length > 0) {
      if (addToSelection) {
        selectBlocks(selectedIds, true);
      } else {
        selectBlocks(selectedIds, false);
      }
    } else if (!addToSelection) {
      // Clear selection if no blocks were selected and not adding to selection
      clearSelection();
    }

    // Reset selection state
    setIsSelecting(false);
    setSelectionRect(null);
  }, [isSelecting, selectionRect, selectBlocks, clearSelection]);

  /**
   * Check if a block is selected
   */
  const isBlockSelected = useCallback((blockId) => {
    return selectedBlockIds.has(blockId);
  }, [selectedBlockIds]);

  /**
   * Get selected blocks from block list
   */
  const getSelectedBlocks = useCallback((blocks) => {
    return blocks.filter(block => selectedBlockIds.has(block.id));
  }, [selectedBlockIds]);

  return {
    selectedBlockIds,
    isSelecting,
    selectionRect,
    selectBlock,
    selectBlocks,
    clearSelection,
    toggleBlockSelection,
    startMarqueeSelection,
    updateMarqueeSelection,
    endMarqueeSelection,
    isBlockSelected,
    getSelectedBlocks
  };
};