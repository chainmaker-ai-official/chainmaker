import { useState, useCallback } from 'react';

export const useSelectionManager = () => {
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<any>(null);

  const selectNode = useCallback((nodeId: string, addToSelection = false) => {
    setSelectedNodeIds(prev => {
      if (addToSelection) {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      } else {
        return new Set([nodeId]);
      }
    });
  }, []);

  const selectNodes = useCallback((nodeIds: string[], addToSelection = false) => {
    setSelectedNodeIds(prev => {
      if (addToSelection) {
        const newSet = new Set(prev);
        nodeIds.forEach(id => newSet.add(id));
        return newSet;
      } else {
        return new Set(nodeIds);
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeIds(new Set());
  }, []);

  const startMarqueeSelection = useCallback((startX: number, startY: number) => {
    setIsSelecting(true);
    setSelectionRect({
      x: startX,
      y: startY,
      width: 0,
      height: 0
    });
  }, []);

  const updateMarqueeSelection = useCallback((currentX: number, currentY: number, startX: number, startY: number) => {
    if (!isSelecting) return;

    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    setSelectionRect({ x, y, width, height });
  }, [isSelecting]);

  const endMarqueeSelection = useCallback((nodes: any[], addToSelection = false) => {
    if (!isSelecting || !selectionRect) {
      setIsSelecting(false);
      setSelectionRect(null);
      return;
    }

    const selectedIds: string[] = [];
    nodes.forEach(node => {
      const nodeRect = {
        x: node.position.x,
        y: node.position.y,
        width: 100,
        height: 60
      };

      const intersects = 
        nodeRect.x < selectionRect.x + selectionRect.width &&
        nodeRect.x + nodeRect.width > selectionRect.x &&
        nodeRect.y < selectionRect.y + selectionRect.height &&
        nodeRect.y + nodeRect.height > selectionRect.y;

      if (intersects) {
        selectedIds.push(node.id);
      }
    });

    if (selectedIds.length > 0) {
      selectNodes(selectedIds, addToSelection);
    } else if (!addToSelection) {
      clearSelection();
    }

    setIsSelecting(false);
    setSelectionRect(null);
  }, [isSelecting, selectionRect, selectNodes, clearSelection]);

  const isNodeSelected = useCallback((nodeId: string) => {
    return selectedNodeIds.has(nodeId);
  }, [selectedNodeIds]);

  return {
    selectedNodeIds,
    isSelecting,
    selectionRect,
    selectNode,
    selectNodes,
    clearSelection,
    startMarqueeSelection,
    updateMarqueeSelection,
    endMarqueeSelection,
    isNodeSelected
  };
};
