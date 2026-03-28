import React, { useState, useCallback, useEffect } from 'react';
import ConnectionOverlay from './ConnectionOverlay';
import NodeRenderer from './NodeRenderer';

interface WorkspaceProps {
  nodes: any[];
  connections: any[];
  activeWire: any;
  curveStyle?: string;
  draggedNodeId: string | null;
  newNodeIds: Set<string>;
  deletingNodeIds: Set<string>;
  onDragStart: (id: string, e: any) => void;
  onDrop: (e: React.DragEvent) => void;
  onDelete: (id: string) => void;
  onConnectionStart: (id: string, portType: string, e: any) => void;
  onConnectionEnd: (id: string, portType: string, e: any) => void;
  onWorkspaceClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  onLabelChange: (id: string, label: string) => void;
  selectedNodeIds: Set<string>;
  isNodeSelected: (id: string) => boolean;
  selectionRect: any;
  isSelecting: boolean;
  onSelectionStart: (x: number, y: number) => void;
  onSelectionUpdate: (cx: number, cy: number, sx: number, sy: number) => void;
  onSelectionEnd: (nodes: any[], addToSelection: boolean) => void;
  onNodeClick: (id: string, e: any) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({
  nodes, connections, activeWire, curveStyle, draggedNodeId,
  newNodeIds, deletingNodeIds, onDragStart, onDrop, onDelete,
  onConnectionStart, onConnectionEnd, onWorkspaceClick, onContextMenu, workspaceRef,
  onLabelChange, selectedNodeIds, isNodeSelected, selectionRect,
  isSelecting, onSelectionStart, onSelectionUpdate, onSelectionEnd, onNodeClick
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const [mouseStartPos, setMouseStartPos] = useState({ x: 0, y: 0 });
  const [marqueeHappened, setMarqueeHappened] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start selection if we're clicking on the workspace background
    // and not on a node or connection.
    if (e.target === e.currentTarget) {
      e.preventDefault();
      
      if (!workspaceRef?.current) return;
      const workspaceRect = workspaceRef.current.getBoundingClientRect();
      const startX = e.clientX - workspaceRect.left + workspaceRef.current.scrollLeft;
      const startY = e.clientY - workspaceRect.top + workspaceRef.current.scrollTop;
      
      setMouseStartPos({ x: startX, y: startY });
      setIsMouseDown(true);
      setIsShiftHeld(e.shiftKey);
      setMarqueeHappened(false);
      onSelectionStart(startX, startY);
    }
  }, [workspaceRef, onSelectionStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseDown || !workspaceRef?.current) return;
    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    const currentX = e.clientX - workspaceRect.left + workspaceRef.current.scrollLeft;
    const currentY = e.clientY - workspaceRect.top + workspaceRef.current.scrollTop;
    
    if (Math.abs(currentX - mouseStartPos.x) > 3 || Math.abs(currentY - mouseStartPos.y) > 3) {
      setMarqueeHappened(true);
    }
    
    onSelectionUpdate(currentX, currentY, mouseStartPos.x, mouseStartPos.y);
  }, [isMouseDown, workspaceRef, mouseStartPos, onSelectionUpdate]);

  const handleMouseUp = useCallback(() => {
    if (!isMouseDown) return;
    setIsMouseDown(false);
    onSelectionEnd(nodes, isShiftHeld);
  }, [isMouseDown, onSelectionEnd, nodes, isShiftHeld]);

  const handleWorkspaceClickInternal = (e: React.MouseEvent) => {
    if (marqueeHappened) {
      setMarqueeHappened(false);
      return;
    }
    onWorkspaceClick(e);
  };

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

  return (
    <div 
      className="workspace"
      ref={workspaceRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onClick={handleWorkspaceClickInternal}
      onContextMenu={(e) => {
        console.log('Workspace Context Menu Event');
        onContextMenu(e);
      }}
      onMouseDown={handleMouseDown}
    >
      <ConnectionOverlay 
        connections={connections}
        nodes={nodes}
        activeWire={activeWire}
        curveStyle={curveStyle}
        workspaceRef={workspaceRef}
        draggedNodeId={draggedNodeId}
      />
      
      {nodes.map(node => (
        <NodeRenderer
          key={node.id}
          node={node}
          connections={connections}
          draggedNodeId={draggedNodeId}
          newNodeIds={newNodeIds}
          deletingNodeIds={deletingNodeIds}
          onDragStart={onDragStart}
          onDelete={onDelete}
          onConnectionStart={onConnectionStart}
          onConnectionEnd={onConnectionEnd}
          onLabelChange={onLabelChange}
          onNodeClick={onNodeClick}
          isSelected={isNodeSelected(node.id)}
        />
      ))}
      
      {selectionRect && isSelecting && (
        <div 
          className="absolute border border-dashed border-[#4a9eff] bg-[#4a9eff1a] pointer-events-none z-[1000]"
          style={{
            left: `${selectionRect.x}px`,
            top: `${selectionRect.y}px`,
            width: `${selectionRect.width}px`,
            height: `${selectionRect.height}px`
          }}
        />
      )}
    </div>
  );
};

export default Workspace;
