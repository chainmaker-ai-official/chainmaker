import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { removeConnectionsForBlock } from '../../../redux/slices/connectionsSlice';

/**
 * Custom hook for managing blocks in the designer workspace
 */
export const useBlockManager = () => {
  const dispatch = useDispatch();
  const [blocks, setBlocks] = useState([]);
  const [newBlockIds, setNewBlockIds] = useState(new Set());
  const [deletingBlockIds, setDeletingBlockIds] = useState(new Set());

  /**
   * Add a new block to the workspace
   */
  const addBlock = useCallback((blockData, mouseEvent = null, workspaceRef = null) => {
    if (!workspaceRef?.current) return null;

    const workspaceElement = workspaceRef.current;
    const workspaceRect = workspaceElement.getBoundingClientRect();
    const workspaceScrollLeft = workspaceElement.scrollLeft;
    const workspaceScrollTop = workspaceElement.scrollTop;
    
    let mouseX, mouseY;
    
    // Use the actual click location if available, otherwise default to center
    if (mouseEvent && typeof mouseEvent === 'object' && 'clientX' in mouseEvent && 'clientY' in mouseEvent) {
      mouseX = mouseEvent.clientX - workspaceRect.left + workspaceScrollLeft;
      mouseY = mouseEvent.clientY - workspaceRect.top + workspaceScrollTop;
    } else {
      mouseX = workspaceRect.width / 2;
      mouseY = workspaceRect.height / 2;
    }
    
    const x = mouseX - 50;
    const y = mouseY - 25;
    
    const label = blockData?.title || blockData?.label || 'Untitled Block';
    
    // Categorization logic to determine visual style of the block
    const blockType = blockData?.category?.toLowerCase().includes('blockchain') || 
                     blockData?.category?.toLowerCase().includes('data provider') ||
                     blockData?.category?.toLowerCase().includes('strategy') ||
                     blockData?.category?.toLowerCase().includes('risk') ||
                     blockData?.category?.toLowerCase().includes('alpha') ||
                     blockData?.category?.toLowerCase().includes('ai') ||
                     blockData?.category?.toLowerCase().includes('execution') ||
                     blockData?.category?.toLowerCase().includes('dashboard') ||
                     blockData?.category?.toLowerCase().includes('ai-native') ? 'blockchain' : 'default';
    
    if (!blockData || !blockData.id) return null;
    
    const newBlock = { 
      ...blockData, 
      id: `${blockData.id}-${Date.now()}`, 
      label,
      type: blockType,
      position: { x, y }
    };
    
    setBlocks(prev => [...prev, newBlock]);
    setNewBlockIds(prev => new Set([...prev, newBlock.id]));
    
    return newBlock;
  }, []);

  /**
   * Delete a block with animation
   */
  const deleteBlock = useCallback((blockId) => {
    setDeletingBlockIds(prev => new Set([...prev, blockId]));
    
    // Remove all connections for this block from Redux
    dispatch(removeConnectionsForBlock(blockId));
    
    setTimeout(() => {
      setBlocks(prev => prev.filter(b => b.id !== blockId));
      setDeletingBlockIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(blockId);
        return newSet;
      });
    }, 300); // 300ms matches the CSS transition
  }, [dispatch]);

  /**
   * Update block position
   */
  const updateBlockPosition = useCallback((blockId, position) => {
    setBlocks(prev => prev.map(b => 
      b.id === blockId ? { ...b, position } : b
    ));
  }, []);

  /**
   * Update block label
   */
  const updateBlockLabel = useCallback((blockId, newLabel) => {
    setBlocks(prev => prev.map(b => 
      b.id === blockId ? { ...b, label: newLabel } : b
    ));
  }, []);

  /**
   * Clear new block animations
   */
  const clearNewBlockAnimations = useCallback(() => {
    setNewBlockIds(new Set());
  }, []);

  return {
    blocks,
    setBlocks,
    newBlockIds,
    deletingBlockIds,
    addBlock,
    deleteBlock,
    updateBlockPosition,
    updateBlockLabel,
    clearNewBlockAnimations
  };
};
