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

export const useFlowConnections = (nodes: any[]) => {
  const dispatch = useDispatch();
  const [connections, setLocalConnections] = useState<any[]>([]);
  const [activeWire, setActiveWire] = useState<any>(null);
  const [curveStyle, setCurveStyle] = useState('smooth');
  
  const connectionSummary = useSelector(selectConnectionSummary);
  const prevConnectionCount = useRef(0);
  
  useEffect(() => {
    setLocalConnections(connectionSummary.connections.map((conn: any) => ({
      id: conn.id,
      sourceId: conn.source,
      targetId: conn.target,
      sourcePort: conn.sourcePort,
      targetPort: conn.targetPort
    })));
  }, [connectionSummary.connections]);
  
  const isInputPortColor = (color: string) => {
    if (!color) return false;
    if (color === '#64ffda' || color === '#00ff00' || color === '#56B6C2') return true;
    if (color === 'rgb(100, 255, 218)' || color === 'rgb(0, 255, 0)' || color === 'rgb(86, 182, 194)') return true;
    if (color.startsWith('rgba')) {
      const rgbMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        return (r === 100 && g === 255 && b === 218) || 
               (r === 0 && g === 255 && b === 0) || 
               (r === 86 && g === 182 && b === 194);
      }
    }
    return false;
  };

  const calculateConnectionOffset = (nodeId: string, connectionPointX: number, connectionPointY: number, workspaceRef: any) => {
    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeElement || !workspaceRef?.current) return { x: 0, y: 0 };
    
    const workspaceElement = workspaceRef.current;
    const workspaceRect = workspaceElement.getBoundingClientRect();
    const nodeRect = nodeElement.getBoundingClientRect();
    const nodeX = nodeRect.left - workspaceRect.left + workspaceElement.scrollLeft;
    const nodeY = nodeRect.top - workspaceRect.top + workspaceElement.scrollTop;
    
    return { x: connectionPointX - nodeX, y: connectionPointY - nodeY };
  };

  const startConnection = useCallback((nodeId: string, portType: string, e: any, workspaceRef: any) => {
    if (!workspaceRef?.current) return;
    
    const workspaceElement = workspaceRef.current;
    const workspaceRect = workspaceElement.getBoundingClientRect();
    
    const startX = e.clientX - workspaceRect.left + workspaceElement.scrollLeft;
    const startY = e.clientY - workspaceRect.top + workspaceElement.scrollTop;
    
    setActiveWire({
      sourceId: nodeId,
      sourcePort: portType,
      startX,
      startY,
      currentX: startX,
      currentY: startY
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setActiveWire((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          currentX: moveEvent.clientX - workspaceRect.left + workspaceElement.scrollLeft,
          currentY: moveEvent.clientY - workspaceRect.top + workspaceElement.scrollTop
        };
      });

      const hoverElement = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY) as HTMLElement;
      document.querySelectorAll('.connection-hover').forEach(el => el.classList.remove('connection-hover'));
      
      if (hoverElement) {
        const hasInputAreaAttr = hoverElement.getAttribute?.('data-input-area') === 'true' || 
                                hoverElement.closest('[data-input-area="true"]');
        if (hasInputAreaAttr) {
          const targetNode = hoverElement.closest('[data-node-id]');
          if (targetNode) {
            targetNode.classList.add('connection-hover');
          }
        }
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      const targetElement = document.elementFromPoint(upEvent.clientX, upEvent.clientY) as HTMLElement;

      if (targetElement) {
        const hasInputAreaAttr = targetElement.getAttribute?.('data-input-area') === 'true' || 
                                targetElement.closest('[data-input-area="true"]');
        
        if (hasInputAreaAttr) {
          const targetNode = targetElement.closest('[data-node-id]');
          const targetNodeId = targetNode?.getAttribute('data-node-id');

          if (targetNodeId && targetNodeId !== nodeId) {
            const targetRect = targetNode!.getBoundingClientRect();
            const targetX = targetRect.left + targetRect.width / 2 - workspaceRect.left + workspaceRef.current.scrollLeft;
            const targetY = targetRect.top - workspaceRect.top + workspaceRef.current.scrollTop;

            const sourceOffset = calculateConnectionOffset(nodeId, startX, startY, workspaceRef);
            const targetOffset = calculateConnectionOffset(targetNodeId, targetX, targetY, workspaceRef);

            const targetConnections = connections.filter(c => c.targetId === targetNodeId);
            const sourceConnections = connections.filter(c => c.sourceId === nodeId);

            const newConnection = {
              id: `conn-${Date.now()}`,
              sourceId: nodeId,
              targetId: targetNodeId,
              sourcePort: portType,
              targetPort: 'input',
              sourceOffset,
              targetOffset,
              sourceIndex: sourceConnections.length,
              targetIndex: targetConnections.length
            };
            
            setLocalConnections(prev => [...prev, newConnection]);
            dispatch(addConnection(newConnection));
          }
        }
      }

      document.querySelectorAll('.connection-hover').forEach(el => el.classList.remove('connection-hover'));
      setActiveWire(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dispatch]);

  const deleteConnection = useCallback((sourceId: string, targetId: string) => {
    setLocalConnections(prev => prev.filter(conn => !(conn.sourceId === sourceId && conn.targetId === targetId)));
    dispatch(removeConnection({ sourceId, targetId }));
  }, [dispatch]);

  return {
    connections,
    setConnections: (newConns: any[]) => {
      setLocalConnections(newConns);
      dispatch(setReduxConnections(newConns));
    },
    activeWire,
    curveStyle,
    setCurveStyle,
    startConnection,
    deleteConnection,
    clearAllConnections: () => {
      setLocalConnections([]);
      dispatch(clearReduxConnections());
    }
  };
};
