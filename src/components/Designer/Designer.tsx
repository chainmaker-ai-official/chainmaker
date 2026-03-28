import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Toolbar from './Toolbar';
import Workspace from './components/Workspace';
import Chat from '../Chat';
import NodePopupMenu from './NodePopupMenu/NodePopupMenu';
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';
import InstructionsPopup from './components/InstructionsPopup';
import { useNodeManager } from './hooks/useNodeManager';
import { useFlowConnections } from './hooks/useFlowConnections';
import { useNodeDrag } from './hooks/useNodeDrag';
import { useSelectionManager } from './hooks/useSelectionManager';
import { selectNodes, fetchNodesFromApi } from '../../redux/slices/nodeSlice';
import { nodeIdMap } from './utils/constants';
import { saveDesignerData, loadDesignerData } from '../../services/apiService';

const Designer: React.FC = () => {
  const dispatch = useDispatch<any>();
  const [showPopup, setShowPopup] = useState(false);
  
  useEffect(() => {
    dispatch(fetchNodesFromApi());
    
    // Load initial data
    const loadData = async () => {
      try {
        const data = await loadDesignerData();
        if (data && data.nodes) {
          nodeManager.setNodes(data.nodes);
        }
      } catch (error) {
        console.error('Failed to load designer data:', error);
      }
    };
    loadData();
  }, [dispatch]);

  const handleSave = async () => {
    try {
      await saveDesignerData({
        nodes: nodeManager.nodes,
        // You might want to save connections too if they are not derived
      });
      alert('Design saved successfully!');
    } catch (error) {
      console.error('Failed to save designer data:', error);
      alert('Failed to save design.');
    }
  };

  const handleLoad = async () => {
    try {
      const data = await loadDesignerData();
      if (data && data.nodes) {
        nodeManager.setNodes(data.nodes);
        alert('Design loaded successfully!');
      }
    } catch (error) {
      console.error('Failed to load designer data:', error);
      alert('Failed to load design.');
    }
  };

  const [popupOpenedViaCtrlClick, setPopupOpenedViaCtrlClick] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  useEffect(() => {
    if (!showPopup) setPopupOpenedViaCtrlClick(false);
  }, [showPopup]);
  
  const nodeManager = useNodeManager();
  const flowConnections = useFlowConnections(nodeManager.nodes);
  const selectionManager = useSelectionManager();
  const nodeDrag = useNodeDrag(nodeManager.nodes, nodeManager.updateNodePosition, selectionManager.selectedNodeIds);
  
  const addedNodes = useSelector(selectNodes);
  const availableNodes = useSelector((state: any) => state.node.nodes || []);
  
  const workspaceRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (nodeManager.newNodeIds.size > 0) {
      const timer = setTimeout(() => {
        nodeManager.clearNewNodeAnimations();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [nodeManager.newNodeIds]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.keyCode === 46) {
        if (selectionManager.selectedNodeIds.size > 0) {
          e.preventDefault();
          confirmDelete();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectionManager, showDeleteConfirm]);

  const confirmDelete = () => {
    selectionManager.selectedNodeIds.forEach(id => nodeManager.deleteNode(id));
    selectionManager.clearSelection();
    setShowDeleteConfirm(false);
  };
  
  const handleWorkspaceClick = (e: React.MouseEvent) => {
    console.log('Workspace Click:', { ctrl: e.ctrlKey, meta: e.metaKey, shift: e.shiftKey });
    if (!e.shiftKey) selectionManager.clearSelection();
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      console.log('Opening popup via Ctrl+Click at:', e.clientX, e.clientY);
      setPopupPosition({ x: e.clientX, y: e.clientY });
      setShowPopup(true);
      setPopupOpenedViaCtrlClick(true);
      e.stopPropagation();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    console.log('Context Menu Event at:', e.clientX, e.clientY);
    e.preventDefault();
    setPopupPosition({ x: e.clientX, y: e.clientY });
    setShowPopup(true);
    setPopupOpenedViaCtrlClick(true);
    e.stopPropagation();
  };
  
  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    const addToSelection = e.shiftKey || e.ctrlKey || e.metaKey;
    selectionManager.selectNode(nodeId, addToSelection);
  };
  
  const handleAddToWorkspace = (activity: any, mouseEvent: any) => {
    const eventToUse = popupOpenedViaCtrlClick ? { clientX: popupPosition.x, clientY: popupPosition.y } : mouseEvent;
    nodeManager.addNode(activity, eventToUse, workspaceRef);
  };

  const handleAddFlow = (template: any, mouseEvent: any) => {
    const eventToUse = popupOpenedViaCtrlClick ? { clientX: popupPosition.x, clientY: popupPosition.y } : mouseEvent;
    const connections = nodeManager.addFlow(template, eventToUse, workspaceRef, availableNodes);
    
    // Add connections to flowConnections
    if (connections && connections.length > 0) {
      // Add all connections at once to avoid state overwrite issues
      flowConnections.setConnections([...flowConnections.connections, ...connections]);
    }
  };
  
  return (
    <div className="main-designer-container">
      <Toolbar
        nodes={nodeManager.nodes}
        setNodes={nodeManager.setNodes}
        logDesignerJson={handleSave}
        loadDesignerJson={handleLoad}
        addNode={nodeManager.addNode}
        workspaceRef={workspaceRef}
        selectedNodeIds={selectionManager.selectedNodeIds}
        clearSelection={selectionManager.clearSelection}
        onRequestDelete={confirmDelete}
        onShowInstructions={() => setShowInstructions(true)}
      />
      
      <div className="designer-layout">
        <div className="designer-center-panel">
          <Workspace
            nodes={nodeManager.nodes}
            connections={flowConnections.connections}
            activeWire={flowConnections.activeWire}
            curveStyle={flowConnections.curveStyle}
            draggedNodeId={nodeDrag.draggedNodeId}
            newNodeIds={nodeManager.newNodeIds}
            deletingNodeIds={nodeManager.deletingNodeIds}
            onDragStart={(id, e) => nodeDrag.startDrag(id, e, workspaceRef)}
            onDrop={(e) => nodeDrag.handleDrop(e, workspaceRef, (data) => nodeManager.addNode(data, e, workspaceRef))}
            onDelete={nodeManager.deleteNode}
            onConnectionStart={(id, type, e) => flowConnections.startConnection(id, type, e, workspaceRef)}
            onConnectionEnd={() => {}}
            onWorkspaceClick={handleWorkspaceClick}
            onContextMenu={handleContextMenu}
            workspaceRef={workspaceRef}
            onLabelChange={nodeManager.updateNodeLabel}
            selectedNodeIds={selectionManager.selectedNodeIds}
            isNodeSelected={selectionManager.isNodeSelected}
            selectionRect={selectionManager.selectionRect}
            isSelecting={selectionManager.isSelecting}
            onSelectionStart={selectionManager.startMarqueeSelection}
            onSelectionUpdate={selectionManager.updateMarqueeSelection}
            onSelectionEnd={(nodes, addToSelection) => selectionManager.endMarqueeSelection(nodes, addToSelection)}
            onNodeClick={handleNodeClick}
          />
        </div>
      </div>
      
      <Chat onDesignerDataUpdate={(data) => console.log('Designer data update:', data)} />
      
      <NodePopupMenu
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        addedNodes={addedNodes}
        availableNodes={availableNodes}
        nodeIdMap={nodeIdMap}
        onAddNodeFeedback={(msg: string) => console.log(msg)}
        onAddToWorkspace={handleAddToWorkspace}
        onAddFlow={handleAddFlow}
        popupOpenedViaCtrlClick={popupOpenedViaCtrlClick}
        popupPosition={popupPosition}
      />

      <InstructionsPopup 
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </div>
  );
};

export default Designer;
