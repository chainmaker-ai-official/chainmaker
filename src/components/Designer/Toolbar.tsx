import React, { useState, useEffect } from 'react';

interface ToolbarProps {
  onMenuItemClick?: (action: string) => void;
  nodes: any[];
  setNodes: React.Dispatch<React.SetStateAction<any[]>>;
  logDesignerJson: () => void;
  loadDesignerJson: () => void;
  loadExampleBot: () => void;
  addNode: (data: any, event: any, ref: any) => void;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  selectedNodeIds: Set<string>;
  clearSelection: () => void;
  onRequestDelete?: () => void;
  onShowInstructions?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onMenuItemClick, nodes, setNodes, logDesignerJson, loadDesignerJson, loadExampleBot, addNode, workspaceRef, selectedNodeIds, clearSelection, onRequestDelete, onShowInstructions
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleMenuClick = (menuName: string, e: React.MouseEvent) => {
    if (activeMenu === menuName) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuName);
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({ x: rect.left, y: rect.bottom });
    }
  };

  const handleMenuItemClick = (action: string) => {
    setActiveMenu(null);
    switch (action) {
      case 'new': setNodes([]); clearSelection(); break;
      case 'save': logDesignerJson(); break;
      case 'load': loadDesignerJson(); break;
      case 'loadExample': loadExampleBot(); break;
      case 'delete':
        if (selectedNodeIds.size > 0) {
          if (onRequestDelete) {
            onRequestDelete();
          } else {
            setNodes(prev => prev.filter(b => !selectedNodeIds.has(b.id)));
            clearSelection();
          }
        }
        break;
      case 'deselectAll': clearSelection(); break;
      case 'object': addNode({ id: 'object', title: 'Object', label: 'Object', isEditable: true }, null, workspaceRef); break;
      case 'bang': addNode({ id: 'bang', title: 'Bang', label: 'Bang', component: 'Bang' }, null, workspaceRef); break;
      case 'log': addNode({ id: 'log', title: 'Log', label: 'Log', component: 'Log' }, null, workspaceRef); break;
    }
    onMenuItemClick?.(action);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeMenu && !(e.target as HTMLElement).closest('.menu-bar') && !(e.target as HTMLElement).closest('.menu-dropdown')) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenu]);

  return (
    <>
      <div className="bg-[#0a1525] px-8 py-0.5 relative font-mono">
        <div className="absolute top-0 left-0 right-0 h-[0.5px] bg-[#56B6C266]"></div>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center menu-bar">
            <div className="flex gap-0">
              {['file', 'edit', 'view', 'put'].map(menu => (
                <button 
                  key={menu}
                  className={`bg-none border-none text-[#ABB2BF] text-[0.9em] px-3 py-1.5 cursor-pointer transition-all hover:bg-[#1a2840] hover:text-[#61AFEF] ${activeMenu === menu ? 'bg-[#1a2840] text-[#61AFEF] border-b-2 border-[#C678DD]' : ''}`}
                  onClick={(e) => handleMenuClick(menu, e)}
                >
                  {menu.charAt(0).toUpperCase() + menu.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {selectedNodeIds.size > 0 && (
              <div className="text-[#56B6C2] text-xs">
                {selectedNodeIds.size} node{selectedNodeIds.size !== 1 ? 's' : ''} selected
              </div>
            )}
            <button 
              onClick={onShowInstructions}
              className="flex items-center gap-2 bg-[#0a1525] text-[#ABB2BF] border border-[#56B6C266] px-4 py-2 font-bold cursor-pointer text-[0.95em] hover:bg-[#1a2840] hover:border-[#61AFEF] hover:text-[#61AFEF]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Instructions</span>
            </button>
            <button className="flex items-center gap-2 bg-[#0a1525] text-[#D19A66] border border-[#56B6C266] px-4 py-2 font-bold cursor-pointer text-[0.95em] hover:bg-[#1a2840] hover:border-[#D19A66]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2L13 8L3 14V2Z" fill="currentColor"/></svg>
              <span>Run</span>
            </button>
          </div>
        </div>
      </div>

      {activeMenu && (
        <div 
          className="fixed bg-[#0a1525] border border-[#56B6C2] border-top-none min-w-[200px] z-[10000] shadow-lg font-mono menu-dropdown"
          style={{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }}
        >
          {activeMenu === 'file' && (
            <>
              <div className="flex justify-between items-center px-4 py-2 text-[#ABB2BF] cursor-pointer hover:bg-[#1a2840] hover:text-[#C678DD]" onClick={() => handleMenuItemClick('new')}>
                <span>New</span><span className="text-[#56B6C2] text-[0.85em] ml-4">Ctrl+N</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2 text-[#ABB2BF] cursor-pointer hover:bg-[#1a2840] hover:text-[#C678DD]" onClick={() => handleMenuItemClick('save')}>
                <span>Save</span><span className="text-[#56B6C2] text-[0.85em] ml-4">Ctrl+S</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2 text-[#ABB2BF] cursor-pointer hover:bg-[#1a2840] hover:text-[#C678DD]" onClick={() => handleMenuItemClick('load')}>
                <span>Load</span><span className="text-[#56B6C2] text-[0.85em] ml-4">Ctrl+L</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2 text-[#ABB2BF] cursor-pointer hover:bg-[#1a2840] hover:text-[#C678DD]" onClick={() => handleMenuItemClick('loadExample')}>
                <span>Load Example Bot</span><span className="text-[#56B6C2] text-[0.85em] ml-4">Ctrl+E</span>
              </div>
            </>
          )}
          {activeMenu === 'edit' && (
            <>
              <div className="flex justify-between items-center px-4 py-2 text-[#ABB2BF] cursor-pointer hover:bg-[#1a2840] hover:text-[#C678DD]" onClick={() => handleMenuItemClick('delete')}>
                <span>Delete</span><span className="text-[#56B6C2] text-[0.85em] ml-4">Del</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2 text-[#ABB2BF] cursor-pointer hover:bg-[#1a2840] hover:text-[#C678DD]" onClick={() => handleMenuItemClick('deselectAll')}>
                <span>Deselect All</span><span className="text-[#56B6C2] text-[0.85em] ml-4">Ctrl+Shift+A</span>
              </div>
            </>
          )}
          {activeMenu === 'put' && (
            <>
              <div className="flex justify-between items-center px-4 py-2 text-[#ABB2BF] cursor-pointer hover:bg-[#1a2840] hover:text-[#C678DD]" onClick={() => handleMenuItemClick('object')}>
                <span>Object</span><span className="text-[#56B6C2] text-[0.85em] ml-4">Ctrl+1</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2 text-[#ABB2BF] cursor-pointer hover:bg-[#1a2840] hover:text-[#C678DD]" onClick={() => handleMenuItemClick('bang')}>
                <span>Bang</span><span className="text-[#56B6C2] text-[0.85em] ml-4">Shift+Ctrl+B</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2 text-[#ABB2BF] cursor-pointer hover:bg-[#1a2840] hover:text-[#C678DD]" onClick={() => handleMenuItemClick('log')}>
                <span>Log</span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Toolbar;
