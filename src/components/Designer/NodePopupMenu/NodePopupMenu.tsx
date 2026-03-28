import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Search, X } from 'lucide-react';
import { addNode } from '../../../redux/slices/nodeSlice';
import { useAnimation, useEscapeKey } from './hooks/useAnimation';
import { useMenuFilter } from './hooks/useMenuFilter';
import { getNodeByMenuItemId, isNodeAdded } from './utils/nodeHelpers';
import { useMenuData, useFilteredMenuData } from './utils/menuData';
import MenuItem from './components/MenuItem';
import SubMenu from './components/SubMenu';
import FlowPreview from './components/FlowPreview';

const NodePopupMenu: React.FC<any> = ({
  showPopup, setShowPopup, addedNodes, availableNodes, nodeIdMap, onAddNodeFeedback, onAddToWorkspace, onAddFlow, popupOpenedViaCtrlClick, popupPosition
}) => {
  const dispatch = useDispatch();
  const [hoveredMenuId, setHoveredMenuId] = useState<string | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [hoveredFlowTemplate, setHoveredFlowTemplate] = useState<any | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [lockedProps, setLockedProps] = useState({ isCtrlClick: false, position: null as {x: number, y: number} | null });

  useEffect(() => {
    if (showPopup) {
      setLockedProps({ isCtrlClick: popupOpenedViaCtrlClick, position: popupPosition });
    }
  }, [showPopup, popupOpenedViaCtrlClick, popupPosition]);

  const { animationClass, isVisible, animationState } = useAnimation(showPopup);
  const { searchQuery, setSearchQuery } = useMenuFilter(isVisible);
  const handleClose = () => setShowPopup(false);
  useEscapeKey(isVisible, handleClose);

  const menuData = useMenuData(addedNodes);
  const filteredMenuData = useFilteredMenuData(menuData, searchQuery);

  const getNode = (menuItemId: string) => getNodeByMenuItemId(menuItemId, nodeIdMap, availableNodes);
  const checkIsAdded = (menuItemId: string) => isNodeAdded(menuItemId, nodeIdMap, availableNodes, addedNodes);

  const handleAddNode = (menuItemId: string, clickEvent: any = null) => {
    const node = getNode(menuItemId);
    if (!node) return;
    
    if (node.type === 'flow') {
      if (onAddFlow) {
        const syntheticEvent = clickEvent || { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
        onAddFlow(node.template, syntheticEvent);
      }
      return;
    }

    if (node.status === 'coming-soon') return;
    
    // Only add to palette if not already there
    if (!addedNodes.some((a: any) => a.id === node.id)) {
      dispatch(addNode(node));
    }

    if (onAddToWorkspace) {
      const syntheticEvent = clickEvent || { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
      onAddToWorkspace(node, syntheticEvent);
    }
  };

  const handlePrimaryItemHover = (item: any) => {
    setHoveredMenuId(item.id);
    if (item.type === 'flow') {
      setHoveredFlowTemplate(item.template);
    } else {
      setHoveredFlowTemplate(null);
    }
  };

  const handlePrimaryItemClick = (item: any, e: any) => {
    if (item.type === 'category') {
      if (selectedMenuId === item.id) { setSelectedMenuId(null); setHoveredMenuId(null); }
      else { setSelectedMenuId(item.id); setHoveredMenuId(item.id); }
    } else {
      handleAddNode(item.id, e);
      if (lockedProps.isCtrlClick || e.ctrlKey || e.metaKey) {
        setShowPopup(false);
      }
    }
  };

  if (animationState === 'hidden') return null;

  const activeSubMenuId = hoveredMenuId || selectedMenuId;
  const subMenuData = filteredMenuData[activeSubMenuId || ''];

  console.log('NodePopupMenu Render:', { showPopup, animationState, lockedProps });

  const effectiveIsCtrlClick = showPopup ? popupOpenedViaCtrlClick : lockedProps.isCtrlClick;
  const effectivePosition = showPopup ? popupPosition : lockedProps.position;

  // Quadrant detection
  const isRight = effectivePosition ? effectivePosition.x > window.innerWidth / 2 : false;
  const isBottom = effectivePosition ? effectivePosition.y > window.innerHeight / 2 : false;

  const popupStyle: React.CSSProperties = effectiveIsCtrlClick && effectivePosition ? {
    position: 'absolute',
    left: `${effectivePosition.x}px`,
    top: `${effectivePosition.y}px`,
    transform: `translate(${isRight ? '-100%' : '0'}, ${isBottom ? '-100%' : '0'})`,
    margin: 0
  } : {};

  return (
    <div 
      className={`popup-overlay ${animationClass} ${effectiveIsCtrlClick ? 'ctrl-click-overlay' : ''}`} 
      onClick={() => setShowPopup(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowPopup(false);
      }}
    >
      <div className="nested-context-menu" ref={menuRef} onClick={(e) => e.stopPropagation()} style={popupStyle}>
        <div className="px-3 py-2 border-b border-[#56B6C2] flex justify-between items-center bg-[#0a1525]">
          <div className="text-[#61AFEF] text-[0.75rem] font-bold uppercase tracking-wider font-mono flex items-center gap-2">
            Add Nodes
            {addedNodes.length > 0 && <span className="bg-[#000C1D] text-[#D19A66] text-[0.6rem] font-bold px-1 py-0.5 border border-[#D19A66]">{addedNodes.length}</span>}
          </div>
          <button className="bg-[#000C1D] border border-[#56B6C2] text-[#C678DD] text-sm cursor-pointer w-[18px] h-[18px] flex items-center justify-center transition-all hover:bg-[#C678DD] hover:text-[#000C1D]" onClick={handleClose}>
            <X size={14} />
          </button>
        </div>
        
        <div className="flex flex-col flex-1 min-h-[200px] relative bg-[#000C1D]">
          <div className="w-[200px] border-r border-[#56B6C2] flex flex-col bg-[#000C1D]">
            <div className="px-3 py-2 border-b border-[#56B6C2] bg-[#0a1525]">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#000C1D] border border-[#56B6C2] px-2 py-1 text-[#ABB2BF] text-[0.75rem] font-mono outline-none transition-all focus:border-[#C678DD] focus:bg-[#0a1525]"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[350px] bg-[#000C1D]">
              {filteredMenuData.root.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-center text-[#56B6C2] w-full bg-[#000C1D]">
                  <div className="mb-3 opacity-50">
                    <Search size={32} />
                  </div>
                  <div className="text-[0.9rem] font-mono">No nodes found</div>
                </div>
              ) : (
                filteredMenuData.root.items.map((item: any) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    isHovered={hoveredMenuId === item.id}
                    isSelected={selectedMenuId === item.id}
                    isNodeAdded={checkIsAdded(item.id)}
                    nodeStatus={getNode(item.id)?.status}
                    onMouseEnter={() => handlePrimaryItemHover(item)}
                    onMouseLeave={() => { if (selectedMenuId !== item.id) { setHoveredMenuId(null); setHoveredFlowTemplate(null); } }}
                    onClick={(e: any) => handlePrimaryItemClick(item, e)}
                  />
                ))
              )}
            </div>
          </div>
          
          <SubMenu
            subMenuData={subMenuData}
            activeMenuId={activeSubMenuId}
            getNodeByMenuItemId={getNode}
            isNodeAdded={checkIsAdded}
            side={isRight ? 'left' : 'right'}
            onSubItemClick={(id: string, e: any) => {
              handleAddNode(id, e);
              if (lockedProps.isCtrlClick || e.ctrlKey || e.metaKey) {
                setShowPopup(false);
              }
            }}
            onMouseEnter={() => { if (hoveredMenuId) setHoveredMenuId(hoveredMenuId); }}
            onMouseLeave={() => { if (!selectedMenuId) setHoveredMenuId(null); }}
            onItemHover={(item: any) => {
              if (item.type === 'flow') setHoveredFlowTemplate(item.template);
              else setHoveredFlowTemplate(null);
            }}
          />

          {hoveredFlowTemplate && (
            <FlowPreview 
              template={hoveredFlowTemplate} 
              side={isRight ? 'left' : 'right'} 
              isSubMenuOpen={!!subMenuData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NodePopupMenu;
