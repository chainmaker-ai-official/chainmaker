import React, { useEffect, useState } from 'react';
import { createBezierCurve } from '../utils/geometry';

interface ConnectionOverlayProps {
  connections: any[];
  nodes: any[];
  activeWire: any;
  curveStyle?: string;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  draggedNodeId: string | null;
}

const getPortPosition = (nodeId: string, portType: string, workspaceRef: React.RefObject<HTMLDivElement | null>, portIndex: number = 0) => {
  const nodeElement = document.querySelector(`[data-node-id="${nodeId}"], [data-block-id="${nodeId}"]`);
  if (!nodeElement || !workspaceRef?.current) return null;

  const workspaceRect = workspaceRef.current.getBoundingClientRect();
  
  // Find the specific port element if it exists
  const isOutput = portType.startsWith('output');
  const portAttr = isOutput ? 'data-output-port' : 'data-input-port';
  const portElements = nodeElement.querySelectorAll(`[${portAttr}="true"]`);
  
  if (portElements.length > 0) {
    const portElement = portElements[portIndex] || portElements[portElements.length - 1];
    const portRect = portElement.getBoundingClientRect();
    return {
      x: portRect.left + portRect.width / 2 - workspaceRect.left + workspaceRef.current.scrollLeft,
      y: portRect.top + portRect.height / 2 - workspaceRect.top + workspaceRef.current.scrollTop
    };
  }

  // Fallback to center of top/bottom if no specific ports found
  const nodeRect = nodeElement.getBoundingClientRect();
  if (!isOutput) {
    return {
      x: nodeRect.left + nodeRect.width / 2 - workspaceRect.left + workspaceRef.current.scrollLeft,
      y: nodeRect.top - workspaceRect.top + workspaceRef.current.scrollTop
    };
  } else {
    return {
      x: nodeRect.left + nodeRect.width / 2 - workspaceRect.left + workspaceRef.current.scrollLeft,
      y: nodeRect.bottom - workspaceRect.top + workspaceRef.current.scrollTop
    };
  }
};

const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({ 
  connections, 
  nodes, 
  activeWire, 
  curveStyle = 'smooth',
  workspaceRef,
  draggedNodeId 
}) => {
  const [, setRenderKey] = useState(0);
  
  useEffect(() => {
    if (draggedNodeId) {
      let animationFrame: number;
      const updatePosition = () => {
        setRenderKey(k => k + 1);
        animationFrame = requestAnimationFrame(updatePosition);
      };
      animationFrame = requestAnimationFrame(updatePosition);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [draggedNodeId]);
  
  useEffect(() => {
    setRenderKey(k => k + 1);
  }, [nodes]);

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-[5]">
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
      
      {connections.map((conn) => {
        const sourcePort = getPortPosition(conn.sourceId, conn.sourcePort || 'output', workspaceRef, conn.sourceIndex);
        const targetPort = getPortPosition(conn.targetId, conn.targetPort || 'input', workspaceRef, conn.targetIndex);

        if (!sourcePort || !targetPort) return null;

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
