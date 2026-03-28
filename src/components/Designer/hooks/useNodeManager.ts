import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { removeConnectionsForNode } from '../../../redux/slices/connectionsSlice';

export const useNodeManager = () => {
  const dispatch = useDispatch();
  const [nodes, setNodes] = useState<any[]>([]);
  const [newNodeIds, setNewNodeIds] = useState<Set<string>>(new Set());
  const [deletingNodeIds, setDeletingNodeIds] = useState<Set<string>>(new Set());

  const addNode = useCallback((nodeData: any, mouseEvent: any = null, workspaceRef: any = null) => {
    if (!workspaceRef?.current) return null;

    const workspaceElement = workspaceRef.current;
    const workspaceRect = workspaceElement.getBoundingClientRect();
    const workspaceScrollLeft = workspaceElement.scrollLeft;
    const workspaceScrollTop = workspaceElement.scrollTop;
    
    let mouseX, mouseY;
    
    if (mouseEvent && typeof mouseEvent === 'object' && 'clientX' in mouseEvent && 'clientY' in mouseEvent) {
      mouseX = mouseEvent.clientX - workspaceRect.left + workspaceScrollLeft;
      mouseY = mouseEvent.clientY - workspaceRect.top + workspaceScrollTop;
    } else {
      mouseX = workspaceRect.width / 2;
      mouseY = workspaceRect.height / 2;
    }
    
    const x = mouseX - 50;
    const y = mouseY - 25;
    
    const label = nodeData?.title || nodeData?.label || 'Untitled Node';
    
    const nodeType = nodeData?.category?.toLowerCase().includes('blockchain') || 
                     nodeData?.category?.toLowerCase().includes('data provider') ||
                     nodeData?.category?.toLowerCase().includes('strategy') ||
                     nodeData?.category?.toLowerCase().includes('risk') ||
                     nodeData?.category?.toLowerCase().includes('alpha') ||
                     nodeData?.category?.toLowerCase().includes('ai') ||
                     nodeData?.category?.toLowerCase().includes('execution') ||
                     nodeData?.category?.toLowerCase().includes('dashboard') ||
                     nodeData?.category?.toLowerCase().includes('ai-native') ? 'blockchain' : 'default';
    
    if (!nodeData || !nodeData.id) return null;
    
    const newNode = { 
      ...nodeData, 
      id: `${nodeData.id}-${Date.now()}`, 
      activityId: nodeData.id,
      label,
      type: nodeType,
      position: { x, y }
    };
    
    setNodes(prev => [...prev, newNode]);
    setNewNodeIds(prev => new Set([...prev, newNode.id]));
    
    return newNode;
  }, []);

  const addFlow = useCallback((template: any, mouseEvent: any, workspaceRef: any, availableNodes: any[]) => {
    if (!workspaceRef?.current) return [];
    
    const workspaceElement = workspaceRef.current;
    const workspaceRect = workspaceElement.getBoundingClientRect();
    const workspaceScrollLeft = workspaceElement.scrollLeft;
    const workspaceScrollTop = workspaceElement.scrollTop;
    
    let baseMouseX, baseMouseY;
    if (mouseEvent && typeof mouseEvent === 'object' && 'clientX' in mouseEvent && 'clientY' in mouseEvent) {
      baseMouseX = mouseEvent.clientX - workspaceRect.left + workspaceScrollLeft;
      baseMouseY = mouseEvent.clientY - workspaceRect.top + workspaceScrollTop;
    } else {
      baseMouseX = workspaceRect.width / 2;
      baseMouseY = workspaceRect.height / 2;
    }

    const createdNodes: any[] = [];
    const newNodesMap = new Map<number, string>(); // index in template -> new node id

    template.nodes.forEach((nodeTpl: any, index: number) => {
      const nodeData = availableNodes.find(n => n.id === nodeTpl.typeId);
      if (!nodeData) return;

      const x = baseMouseX + nodeTpl.position.x;
      const y = baseMouseY + nodeTpl.position.y;
      
      const newNode = { 
        ...nodeData, 
        id: `${nodeData.id}-${Date.now()}-${index}`, 
        activityId: nodeData.id,
        label: nodeTpl.label || nodeData.title,
        type: 'blockchain', 
        position: { x, y }
      };
      
      createdNodes.push(newNode);
      newNodesMap.set(index, newNode.id);
    });

    setNodes(prev => [...prev, ...createdNodes]);
    setNewNodeIds(prev => new Set([...prev, ...createdNodes.map(n => n.id)]));

    // Return connections to be added
    const connectionsToAdd = template.connections.map((conn: any) => ({
      id: `conn-${Date.now()}-${Math.random()}`,
      sourceId: newNodesMap.get(conn.sourceIndex),
      targetId: newNodesMap.get(conn.targetIndex),
      sourcePort: conn.sourcePort,
      targetPort: conn.targetPort,
      sourceOffset: { x: 100, y: 25 }, 
      targetOffset: { x: 0, y: 25 }
    }));

    return connectionsToAdd;
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setDeletingNodeIds(prev => new Set([...prev, nodeId]));
    
    dispatch(removeConnectionsForNode(nodeId));
    
    setTimeout(() => {
      setNodes(prev => prev.filter(b => b.id !== nodeId));
      setDeletingNodeIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });
    }, 300);
  }, [dispatch]);

  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(prev => prev.map(b => 
      b.id === nodeId ? { ...b, position } : b
    ));
  }, []);

  const updateNodeLabel = useCallback((nodeId: string, newLabel: string) => {
    setNodes(prev => prev.map(b => 
      b.id === nodeId ? { ...b, label: newLabel } : b
    ));
  }, []);

  const clearNewNodeAnimations = useCallback(() => {
    setNewNodeIds(new Set());
  }, []);

  return {
    nodes,
    setNodes,
    newNodeIds,
    deletingNodeIds,
    addNode,
    addFlow,
    deleteNode,
    updateNodePosition,
    updateNodeLabel,
    clearNewNodeAnimations
  };
};
