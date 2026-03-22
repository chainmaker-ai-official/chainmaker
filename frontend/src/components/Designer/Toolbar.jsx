import React, { useState, useEffect } from 'react';
import './Toolbar.css'; // Toolbar-specific CSS

const Toolbar = ({ 
  onMenuItemClick,
  blocks,
  setBlocks,
  logDesignerJson,
  addBlock,
  workspaceRef,
  selectedBlockIds = [],
  clearSelection
}) => {
  // Menu bar state
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Helper to get selection count (handles both array and Set)
  const getSelectionCount = () => {
    if (!selectedBlockIds) return 0;
    if (Array.isArray(selectedBlockIds)) {
      return selectedBlockIds.length;
    } else if (selectedBlockIds instanceof Set) {
      return selectedBlockIds.size;
    }
    return 0;
  };

  // Helper to check if a block is selected (handles both array and Set)
  const isBlockSelected = (blockId) => {
    if (!selectedBlockIds) return false;
    if (Array.isArray(selectedBlockIds)) {
      return selectedBlockIds.includes(blockId);
    } else if (selectedBlockIds instanceof Set) {
      return selectedBlockIds.has(blockId);
    }
    return false;
  };

  // Menu click handler
  const handleMenuClick = (menuName, e) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuName);
      // Calculate position for dropdown
      if (e && e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({ x: rect.left, y: rect.bottom });
      }
    }
  };

  // Menu item click handler
  const handleMenuItemClick = (action) => {
    setActiveMenu(null);
    
    // Handle different menu actions
    switch (action) {
      case 'new':
        // Clear all blocks
        if (setBlocks) {
          setBlocks([]);
        }
        if (clearSelection) {
          clearSelection();
        }
        break;
      case 'open':
        // Placeholder for open functionality
        // In a real implementation, this would open a file dialog
        break;
      case 'save':
        // Placeholder for save functionality
        if (logDesignerJson) {
          logDesignerJson(); // Log current state as placeholder
        }
        break;
      case 'saveAs':
        // Placeholder for save as functionality
        break;
      case 'export':
        // Placeholder for export functionality
        break;
      case 'undo':
        // Placeholder for undo functionality
        break;
      case 'redo':
        // Placeholder for redo functionality
        break;
      case 'cut':
        // Placeholder for cut functionality
        break;
      case 'copy':
        // Placeholder for copy functionality
        break;
      case 'paste':
        // Placeholder for paste functionality
        break;
      case 'delete':
        // Delete selected blocks
        if (getSelectionCount() > 0 && setBlocks) {
          setBlocks(prevBlocks => 
            prevBlocks.filter(block => !isBlockSelected(block.id))
          );
          if (clearSelection) {
            clearSelection();
          }
        }
        break;
      case 'selectAll':
        // Select all blocks
        if (blocks && blocks.length > 0) {
          // Note: This would require updating the selection state
          // Since selection is managed in Designer.jsx, we need a callback
          // For now, this is a placeholder
          console.log('Select all would select', blocks.length, 'blocks');
        }
        break;
      case 'deselectAll':
        // Clear selection
        if (clearSelection) {
          clearSelection();
        }
        break;
      case 'zoomIn':
        // Placeholder for zoom in functionality
        break;
      case 'zoomOut':
        // Placeholder for zoom out functionality
        break;
      case 'resetZoom':
        // Placeholder for reset zoom functionality
        break;
      case 'showGrid':
        // Placeholder for show grid functionality
        break;
      case 'snapToGrid':
        // Placeholder for snap to grid functionality
        break;
      case 'fullscreen':
        // Placeholder for fullscreen functionality
        break;
      case 'object':
        // Add a draggable block to the workspace
        if (addBlock && workspaceRef) {
          const defaultBlockData = {
            id: 'object',
            title: 'Object',
            label: 'Object',
            isEditable: true
          };
          addBlock(defaultBlockData, null, workspaceRef);
        }
        break;
      case 'bang':
        // Add a bang toggle block to the workspace
        if (addBlock && workspaceRef) {
          const bangBlockData = {
            id: 'bang',
            title: 'Bang',
            label: 'Bang',
            component: 'Bang'
          };
          addBlock(bangBlockData, null, workspaceRef);
        }
        break;
      case 'log':
        // Add a log display block to the workspace
        if (addBlock && workspaceRef) {
          const logBlockData = {
            id: 'log',
            title: 'Log',
            label: 'Log',
            component: 'Log'
          };
          addBlock(logBlockData, null, workspaceRef);
        }
        break;
      default:
        // Unknown action
    }

    // Call parent callback if provided
    if (onMenuItemClick) {
      onMenuItemClick(action);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeMenu && !e.target.closest('.menu-bar') && !e.target.closest('.menu-dropdown')) {
        setActiveMenu(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeMenu]);

  // Show selection count in toolbar
  const selectionCount = getSelectionCount();

  return (
    <>
      <div className="designer-header">
        <div className="header-content">
          <div className="designer-toolbar">
            <div className="toolbar-green-line"></div>
            <div className="toolbar-content">
              <div className="toolbar-left menu-bar">
                {/* Menu Bar Items */}
                <div className="menu-item-container">
                  <button 
                    className={`menu-item ${activeMenu === 'file' ? 'active' : ''}`}
                    onClick={(e) => handleMenuClick('file', e)}
                  >
                    File
                  </button>
                  <button 
                    className={`menu-item ${activeMenu === 'edit' ? 'active' : ''}`}
                    onClick={(e) => handleMenuClick('edit', e)}
                  >
                    Edit
                  </button>
                  <button 
                    className={`menu-item ${activeMenu === 'view' ? 'active' : ''}`}
                    onClick={(e) => handleMenuClick('view', e)}
                  >
                    View
                  </button>
                  <button 
                    className={`menu-item ${activeMenu === 'put' ? 'active' : ''}`}
                    onClick={(e) => handleMenuClick('put', e)}
                  >
                    Put
                  </button>
                </div>
              </div>
              <div className="toolbar-right">
                {selectionCount > 0 && (
                  <div className="selection-counter">
                    {selectionCount} block{selectionCount !== 1 ? 's' : ''} selected
                  </div>
                )}
                <button className="play-button">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 2L13 8L3 14V2Z" fill="currentColor"/>
                  </svg>
                  <span>Run</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Dropdowns */}
      {activeMenu === 'file' && (
        <div 
          className="menu-dropdown file-menu"
          style={{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }}
        >
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('new')}>
            <span className="menu-item-label">New</span>
            <span className="menu-item-shortcut">Ctrl+N</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('open')}>
            <span className="menu-iteml-label">Open...</span>
            <span className="menu-item-shortcut">Ctrl+O</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('save')}>
            <span className="menu-item-label">Save</span>
            <span className="menu-item-shortcut">Ctrl+S</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('saveAs')}>
            <span className="menu-item-label">Save As...</span>
            <span className="menu-item-shortcut">Ctrl+Shift+S</span>
          </div>
          <div className="menu-dropdown-divider"></div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('export')}>
            <span className="menu-item-label">Export...</span>
          </div>
        </div>
      )}

      {activeMenu === 'edit' && (
        <div 
          className="menu-dropdown edit-menu"
          style={{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }}
        >
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('undo')}>
            <span className="menu-item-label">Undo</span>
            <span className="menu-item-shortcut">Ctrl+Z</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('redo')}>
            <span className="menu-item-label">Redo</span>
            <span className="menu-item-shortcut">Ctrl+Y</span>
          </div>
          <div className="menu-dropdown-divider"></div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('cut')}>
            <span className="menu-item-label">Cut</span>
            <span className="menu-item-shortcut">Ctrl+X</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('copy')}>
            <span className="menu-item-label">Copy</span>
            <span className="menu-item-shortcut">Ctrl+C</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('paste')}>
            <span className="menu-item-label">Paste</span>
            <span className="menu-item-shortcut">Ctrl+V</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('delete')}>
            <span className="menu-item-label">Delete</span>
            <span className="menu-item-shortcut">Del</span>
          </div>
          <div className="menu-dropdown-divider"></div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('selectAll')}>
            <span className="menu-item-label">Select All</span>
            <span className="menu-item-shortcut">Ctrl+A</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('deselectAll')}>
            <span className="menu-item-label">Deselect All</span>
            <span className="menu-item-shortcut">Ctrl+Shift+A</span>
          </div>
        </div>
      )}

      {activeMenu === 'view' && (
        <div 
          className="menu-dropdown view-menu"
          style={{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }}
        >
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('zoomIn')}>
            <span className="menu-item-label">Zoom In</span>
            <span className="menu-item-shortcut">Ctrl++</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('zoomOut')}>
            <span className="menu-item-label">Zoom Out</span>
            <span className="menu-item-shortcut">Ctrl+-</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('resetZoom')}>
            <span className="menu-item-label">Reset Zoom</span>
            <span className="menu-item-shortcut">Ctrl+0</span>
          </div>
          <div className="menu-dropdown-divider"></div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('showGrid')}>
            <span className="menu-item-label">Show Grid</span>
            <span className="menu-item-shortcut">Ctrl+G</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('snapToGrid')}>
            <span className="menu-item-label">Snap to Grid</span>
            <span className="menu-item-shortcut">Ctrl+Shift+G</span>
          </div>
          <div className="menu-dropdown-divider"></div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('fullscreen')}>
            <span className="menu-item-label">Fullscreen</span>
            <span className="menu-item-shortcut">F11</span>
          </div>
        </div>
      )}

      {activeMenu === 'put' && (
        <div 
          className="menu-dropdown put-menu"
          style={{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }}
        >
          {/* Section 1: Objects (Ctrl+ shortcuts) */}
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('object')}>
            <span className="menu-item-label">Object</span>
            <span className="menu-item-shortcut">Ctrl+1</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('message')}>
            <span className="menu-item-label">Message</span>
            <span className="menu-item-shortcut">Ctrl+2</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('number')}>
            <span className="menu-item-label">Number</span>
            <span className="menu-item-shortcut">Ctrl+3</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('list')}>
            <span className="menu-item-label">List</span>
            <span className="menu-item-shortcut">Ctrl+4</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('symbol')}>
            <span className="menu-item-label">Symbol</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('comment')}>
            <span className="menu-item-label">Comment</span>
            <span className="menu-item-shortcut">Ctrl+5</span>
          </div>
          
          {/* Section 2: GUI Elements (Shift+Ctrl+ shortcuts) */}
          <div className="menu-dropdown-divider"></div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('bang')}>
            <span className="menu-item-label">Bang</span>
            <span className="menu-item-shortcut">Shift+Ctrl+B</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('log')}>
            <span className="menu-item-label">Log</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('toggle')}>
            <span className="menu-item-label">Toggle</span>
            <span className="menu-item-shortcut">Shift+Ctrl+T</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('number2')}>
            <span className="menu-item-label">Number2</span>
            <span className="menu-item-shortcut">Shift+Ctrl+N</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('vslider')}>
            <span className="menu-item-label">Vslider</span>
            <span className="menu-item-shortcut">Shift+Ctrl+V</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('hslider')}>
            <span className="menu-item-label">Hslider</span>
            <span className="menu-item-shortcut">Shift+Ctrl+J</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('vradio')}>
            <span className="menu-item-label">Vradio</span>
            <span className="menu-item-shortcut">Shift+Ctrl+D</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('hradio')}>
            <span className="menu-item-label">Hradio</span>
            <span className="menu-item-shortcut">Shift+Ctrl+I</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('vumeter')}>
            <span className="menu-item-label">VU Meter</span>
            <span className="menu-item-shortcut">Shift+Ctrl+U</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('canvas')}>
            <span className="menu-item-label">Canvas</span>
            <span className="menu-item-shortcut">Shift+Ctrl+C</span>
          </div>
          
          {/* Section 3: Graph/Array (Shift+Ctrl+ shortcuts) */}
          <div className="menu-dropdown-divider"></div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('graph')}>
            <span className="menu-item-label">Graph</span>
            <span className="menu-item-shortcut">Shift+Ctrl+G</span>
          </div>
          <div className="menu-dropdown-item" onClick={() => handleMenuItemClick('array')}>
            <span className="menu-item-label">Array</span>
            <span className="menu-item-shortcut">Shift+Ctrl+A</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Toolbar;