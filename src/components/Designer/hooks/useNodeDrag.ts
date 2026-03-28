import { useState, useCallback } from 'react';

export const useNodeDrag = (nodes: any[], updateNodePosition: (id: string, pos: { x: number; y: number }) => void, selectedNodeIds: Set<string> = new Set()) => {
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [isDraggingMultiple, setIsDraggingMultiple] = useState(false);
  const [dragOffsets, setDragOffsets] = useState<any[]>([]);

  const startDrag = useCallback((nodeId: string, e: any, workspaceRef: any) => {
    setDraggedNodeId(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !workspaceRef?.current || !e) return;

    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    const initialMouseX = e.clientX - workspaceRect.left + workspaceRef.current.scrollLeft;
    const initialMouseY = e.clientY - workspaceRect.top + workspaceRef.current.scrollTop;
    
    const isMultiDrag = selectedNodeIds.has(nodeId) && selectedNodeIds.size > 1;
    let currentOffsets: any[] = [];
    
    if (isMultiDrag) {
      currentOffsets = Array.from(selectedNodeIds).map(id => {
        const selectedNode = nodes.find(n => n.id === id);
        if (!selectedNode) return null;
        
        return {
          nodeId: id,
          offsetX: initialMouseX - selectedNode.position.x,
          offsetY: initialMouseY - selectedNode.position.y
        };
      }).filter(Boolean);

      setDragOffsets(currentOffsets);
      setIsDraggingMultiple(true);
    } else {
      const grabOffsetX = initialMouseX - node.position.x;
      const grabOffsetY = initialMouseY - node.position.y;
      
      currentOffsets = [{
        nodeId,
        offsetX: grabOffsetX,
        offsetY: grabOffsetY
      }];
      setDragOffsets(currentOffsets);
      setIsDraggingMultiple(false);
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const mouseX = moveEvent.clientX - workspaceRect.left + workspaceRef.current.scrollLeft;
      const mouseY = moveEvent.clientY - workspaceRect.top + workspaceRef.current.scrollTop;
      
      currentOffsets.forEach(offset => {
        if (!offset) return;
        const x = mouseX - offset.offsetX;
        const y = mouseY - offset.offsetY;
        updateNodePosition(offset.nodeId, { x, y });
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setDraggedNodeId(null);
      setIsDraggingMultiple(false);
      setDragOffsets([]);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [nodes, updateNodePosition, selectedNodeIds, dragOffsets]);

  const handlePaletteDrop = useCallback((e: any, nodeData: any, workspaceRef: any) => {
    if (!workspaceRef?.current) return;

    const workspaceElement = workspaceRef.current;
    const workspaceRect = workspaceElement.getBoundingClientRect();
    
    if (
      e.clientX < workspaceRect.left || 
      e.clientX > workspaceRect.right || 
      e.clientY < workspaceRect.top || 
      e.clientY > workspaceRect.bottom
    ) return; 

    const workspaceScrollLeft = workspaceElement.scrollLeft;
    const workspaceScrollTop = workspaceElement.scrollTop;
    
    const mouseX = e.clientX - workspaceRect.left + workspaceScrollLeft;
    const mouseY = e.clientY - workspaceRect.top + workspaceScrollTop;
    
    const x = mouseX - 50; 
    const y = mouseY - 25; 
    
    const label = nodeData.title || nodeData.label || 'Untitled Node';
    
    const nodeType = nodeData.category?.toLowerCase().includes('blockchain') || 
                     nodeData.category?.toLowerCase().includes('data provider') ||
                     nodeData.category?.toLowerCase().includes('strategy') ||
                     nodeData.category?.toLowerCase().includes('risk') ||
                     nodeData.category?.toLowerCase().includes('alpha') ||
                     nodeData.category?.toLowerCase().includes('ai') ||
                     nodeData.category?.toLowerCase().includes('execution') ||
                     nodeData.category?.toLowerCase().includes('dashboard') ||
                     nodeData.category?.toLowerCase().includes('ai-native') ? 'blockchain' : 'default';
    
    const newNode = { 
      ...nodeData, 
      id: `${nodeData.id}-${Date.now()}`,
      label,
      type: nodeType,
      position: { x, y }
    };
    
    return newNode;
  }, []);

  const handleDrop = useCallback((e: any, workspaceRef: any, addNode: (data: any) => void) => {
    e.preventDefault();

    const paletteData = e.dataTransfer.getData('application/x-palette-node');
    if (paletteData) {
      try {
        const nodeData = JSON.parse(paletteData);
        const newNode = handlePaletteDrop(e, nodeData, workspaceRef);
        if (newNode) {
          addNode(newNode);
        }
      } catch (err) {
        console.error('Failed to parse palette node data', err);
      }
      return;
    }

    if (draggedNodeId && workspaceRef?.current) {
      const draggedNodeIndex = nodes.findIndex(n => n.id === draggedNodeId);
      if (draggedNodeIndex !== -1) {
        const workspaceElement = workspaceRef.current;
        const workspaceRect = workspaceElement.getBoundingClientRect();
        const workspaceScrollLeft = workspaceElement.scrollLeft;
        const workspaceScrollTop = workspaceElement.scrollTop;
        
        const mouseX = e.clientX - workspaceRect.left + workspaceScrollLeft;
        const mouseY = e.clientY - workspaceRect.top + workspaceScrollTop;
        
        const x = mouseX - 50;
        const y = mouseY - 25;
        
        updateNodePosition(draggedNodeId, { x, y });
      }
      setDraggedNodeId(null);
      setIsDraggingMultiple(false);
      setDragOffsets([]);
      return;
    }

    setDraggedNodeId(null);
    setIsDraggingMultiple(false);
    setDragOffsets([]);
  }, [draggedNodeId, nodes, updateNodePosition, handlePaletteDrop]);

  return {
    draggedNodeId,
    isDraggingMultiple,
    startDrag,
    handleDrop,
    handlePaletteDrop
  };
};
