import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Designer.css';
import Chat from '../Chat/Chat';
import ActivityPopupMenu from './ActivityPopupMenu/index';
import Toolbar from './Toolbar';
import Workspace from './components/Workspace';
import { useBlockManager } from './hooks/useBlockManager';
import { useFlowConnections } from './hooks/useFlowConnections';
import { useBlockDrag } from './hooks/useBlockDrag';
import { useSelectionManager } from './hooks/useSelectionManager';
import { selectMarketplaceActivities } from '../../redux/slices/marketplaceSlice';
import { activityIdMap } from './utils/constants';

/**
 * Main Designer component - The "Orchestrator" (now ~100 lines)
 */
const Designer = () => {
  const dispatch = useDispatch();
  
  // State for popup management
  const [showPopup, setShowPopup] = React.useState(false);
  const [popupOpenedViaCtrlClick, setPopupOpenedViaCtrlClick] = React.useState(false);
  
  // Custom hooks for managing different aspects of the designer
  const blockManager = useBlockManager();
  const flowConnections = useFlowConnections(blockManager.blocks);
  const selectionManager = useSelectionManager();
  const blockDrag = useBlockDrag(blockManager.blocks, blockManager.updateBlockPosition, selectionManager.selectedBlockIds);
  
  // Redux selectors
  const addedActivities = useSelector(selectMarketplaceActivities);
  const marketplaceActivities = useSelector((state) => state.marketplace.activities || []);
  
  // Workspace reference
  const workspaceRef = React.useRef(null);
  
  // Effects for cleanup
  useEffect(() => {
    if (blockManager.newBlockIds.size > 0) {
      const timer = setTimeout(() => {
        blockManager.clearNewBlockAnimations();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [blockManager.newBlockIds]);
  
  useEffect(() => {
    if (!showPopup) {
      setPopupOpenedViaCtrlClick(false);
    }
  }, [showPopup]);
  
  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete key handling for selected blocks
      if (e.key === 'Delete' || e.keyCode === 46) {
        const selectionCount = selectionManager.selectedBlockIds.size;
        if (selectionCount > 0) {
          e.preventDefault();
          e.stopPropagation();
          
          // Delete all selected blocks
          selectionManager.selectedBlockIds.forEach(blockId => {
            blockManager.deleteBlock(blockId);
          });
          
          // Clear selection after deletion
          selectionManager.clearSelection();
        }
      }
    };
    
    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [blockManager, selectionManager]);
  
  // Event handlers
  const handleDesignerClick = () => {
    if (showPopup) setShowPopup(false);
  };
  
  const handleWorkspaceClick = (e) => {
    // Clear selection when clicking on empty workspace (without Shift)
    if (!e.shiftKey) {
      selectionManager.clearSelection();
    }
    
    if (e.ctrlKey || e.metaKey) {
      setShowPopup(true);
      setPopupOpenedViaCtrlClick(true);
      e.stopPropagation();
    }
  };
  
  const handleBlockClick = (blockId, e) => {
    // Handle block selection
    const addToSelection = e.shiftKey || e.ctrlKey || e.metaKey;
    selectionManager.selectBlock(blockId, addToSelection);
  };
  
  const handleAddToWorkspace = (activity, mouseEvent) => {
    const newBlock = blockManager.addBlock(activity, mouseEvent, workspaceRef);
    if (newBlock) logDesignerJson();
  };
  
  const handleDrop = (e) => {
    blockDrag.handleDrop(e, workspaceRef, blockManager.addBlock);
  };
  
  const handleConnectionStart = (blockId, portType, e) => {
    flowConnections.startConnection(blockId, portType, e, workspaceRef);
  };
  
  const handleConnectionEnd = () => {
    // Logic handled in useFlowConnections hook
  };
  
  const handleDeleteConnection = (sourceId, targetId) => {
    flowConnections.deleteConnection(sourceId, targetId);
  };
  
  const handleDesignerDataUpdate = () => {
    // Hook for external data updates
  };
  
  const handleAddActivityFeedback = () => {
    // Feedback handler
  };
  
  const logDesignerJson = () => {
    const output = blockManager.blocks.map(block => {
      const blockData = { ...block };
      if (blockData.id && typeof blockData.id === 'string') {
        const originalIdMatch = blockData.id.match(/^(.*)-\d+$/);
        if (originalIdMatch) blockData.originalId = originalIdMatch[1];
      }
      return blockData;
    });
  };
  
  return (
    <div className="main-designer-container" onClick={handleDesignerClick}>
      <Toolbar
        onMenuItemClick={() => {}}
        blocks={blockManager.blocks}
        setBlocks={blockManager.setBlocks}
        logDesignerJson={logDesignerJson}
        addBlock={blockManager.addBlock}
        workspaceRef={workspaceRef}
        selectedBlockIds={selectionManager.selectedBlockIds}
        clearSelection={selectionManager.clearSelection}
      />
      
      <div className="designer-layout">
        <div className="designer-center-panel">
          <Workspace
            blocks={blockManager.blocks}
            connections={flowConnections.connections}
            activeWire={flowConnections.activeWire}
            curveStyle={flowConnections.curveStyle}
            draggedBlockId={blockDrag.draggedBlockId}
            newBlockIds={blockManager.newBlockIds}
            deletingBlockIds={blockManager.deletingBlockIds}
            onDragStart={(blockId, e) => blockDrag.startDrag(blockId, e, workspaceRef)}
            onDrop={handleDrop}
            onDelete={blockManager.deleteBlock}
            onConnectionStart={handleConnectionStart}
            onConnectionEnd={handleConnectionEnd}
            onWorkspaceClick={handleWorkspaceClick}
            workspaceRef={workspaceRef}
            onLabelChange={blockManager.updateBlockLabel}
            // Selection props
            selectedBlockIds={selectionManager.selectedBlockIds}
            isBlockSelected={selectionManager.isBlockSelected}
            selectionRect={selectionManager.selectionRect}
            isSelecting={selectionManager.isSelecting}
            onSelectionStart={selectionManager.startMarqueeSelection}
            onSelectionUpdate={selectionManager.updateMarqueeSelection}
            onSelectionEnd={(blocks) => selectionManager.endMarqueeSelection(blocks, false)}
            onBlockClick={handleBlockClick}
          />
        </div>
      </div>
      
      <Chat onDesignerDataUpdate={handleDesignerDataUpdate} />
      
      <ActivityPopupMenu
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        addedActivities={addedActivities}
        dispatch={dispatch}
        marketplaceActivities={marketplaceActivities}
        activityIdMap={activityIdMap}
        onAddActivityFeedback={handleAddActivityFeedback}
        onAddToWorkspace={handleAddToWorkspace}
        popupOpenedViaCtrlClick={popupOpenedViaCtrlClick}
      />
    </div>
  );
};

export default Designer;