/**
 * ActivityPopupMenu - The "Brain" (main container)
 * Refactored from single-file component into modular structure
 */
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addActivity } from '../../../redux/slices/marketplaceSlice';
import { setActiveMenu, setActivePanel, setPanelOpen } from '../../../redux/slices/uiSlice';

// Hooks
import { useAnimation, useEscapeKey } from './hooks/useAnimation';
import { useMenuFilter } from './hooks/useMenuFilter';

// Utils
import { getActivityByMenuItemId, isActivityAdded } from './utils/activityHelpers';
import { useMenuData, useFilteredMenuData } from './utils/menuData';

// Components
import MenuHeader from './components/MenuHeader';
import MenuSearch from './components/MenuSearch';
import MenuItem from './components/MenuItem';
import SubMenu from './components/SubMenu';

// Styles
import './ActivityPopupMenu.css';

const ActivityPopupMenu = ({
  showPopup,
  setShowPopup,
  addedActivities,
  dispatch: dispatchProp,
  marketplaceActivities,
  activityIdMap,
  onAddActivityFeedback,
  onAddToWorkspace,
  popupOpenedViaCtrlClick
}) => {
  // Use dispatch from props or create new one
  const dispatch = dispatchProp || useDispatch();

  // State for nested context menu
  const [hoveredMenuId, setHoveredMenuId] = useState(null);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  
  // State for selected activity item (for visual feedback)
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  
  // Ref for the menu container to check click outside
  const menuRef = useRef(null);

  // Animation hook
  const { animationState, animationClass, isVisible } = useAnimation(showPopup);

  // Search/filter hook
  const { searchQuery, setSearchQuery } = useMenuFilter(isVisible);

  // Escape key handler
  const handleClose = () => setShowPopup(false);
  useEscapeKey(isVisible, handleClose);

  // Menu data hooks
  const menuData = useMenuData(addedActivities);
  const filteredMenuData = useFilteredMenuData(menuData, searchQuery);

  // Effect to clear selected activity visual feedback when menu opens
  useEffect(() => {
    if (animationState === 'entering' || animationState === 'visible') {
      setSelectedActivityId(null);
    }
  }, [animationState]);

  // Helper functions using utils
  const getActivity = (menuItemId) => getActivityByMenuItemId(menuItemId, activityIdMap, marketplaceActivities);
  const checkIsAdded = (menuItemId) => isActivityAdded(menuItemId, activityIdMap, marketplaceActivities, addedActivities);

  // Function to handle adding an activity
  const handleAddActivity = (menuItemId, clickEvent = null) => {
    const activity = getActivity(menuItemId);
    if (!activity) {
      onAddActivityFeedback('Activity not found');
      return;
    }

    if (activity.status === 'coming-soon') {
      onAddActivityFeedback(`"${activity.title}" is coming soon!`);
      return;
    }

    const isAlreadyAdded = addedActivities.some(a => a.id === activity.id);
    if (isAlreadyAdded) {
      onAddActivityFeedback(`"${activity.title}" is already in your palette`);
      return;
    }

    setSelectedActivityId(menuItemId);
    dispatch(addActivity(activity));
    onAddActivityFeedback(`Added "${activity.title}" to palette`);
    
    // Also add the block to workspace immediately
    if (onAddToWorkspace) {
      const syntheticEvent = clickEvent || {
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 2,
        ctrlKey: false,
        metaKey: false
      };
      onAddToWorkspace(activity, syntheticEvent);
    }
    
    setTimeout(() => {
      setSelectedActivityId(null);
    }, 500);
  };

  // Handle click on primary menu item
  const handlePrimaryItemClick = (item, e) => {
    if (item.type === 'category') {
      if (selectedMenuId === item.id) {
        setSelectedMenuId(null);
        setHoveredMenuId(null);
      } else {
        setSelectedMenuId(item.id);
        setHoveredMenuId(item.id);
      }
    } else if (item.type === 'action') {
      dispatch(setActiveMenu('classes'));
      dispatch(setActivePanel('panel-2'));
      dispatch(setPanelOpen(true));
      setShowPopup(false);
    } else {
      if (popupOpenedViaCtrlClick) {
        const activity = getActivity(item.id);
        if (activity && onAddToWorkspace) {
          onAddToWorkspace(activity, e);
          setShowPopup(false);
        }
      } else {
        if (e.ctrlKey || e.metaKey) {
          const activity = getActivity(item.id);
          if (activity && onAddToWorkspace) {
            onAddToWorkspace(activity, e);
            setShowPopup(false);
          }
        } else {
          handleAddActivity(item.id, e);
        }
      }
    }
  };

  // Handle click on submenu item
  const handleSubItemClick = (subItemId, e) => {
    if (popupOpenedViaCtrlClick) {
      const activity = getActivity(subItemId);
      if (activity && onAddToWorkspace) {
        onAddToWorkspace(activity, e);
        setShowPopup(false);
      }
    } else {
      if (e.ctrlKey || e.metaKey) {
        const activity = getActivity(subItemId);
        if (activity && onAddToWorkspace) {
          onAddToWorkspace(activity, e);
          setShowPopup(false);
        }
      } else {
        handleAddActivity(subItemId, e);
      }
    }
  };

  // Don't render anything if hidden
  if (animationState === 'hidden') return null;

  const activeSubMenuId = hoveredMenuId || selectedMenuId;
  const subMenuData = filteredMenuData[activeSubMenuId];

  return (
    <div className={`popup-overlay ${animationClass}`} onClick={() => setShowPopup(false)}>
      <div className="nested-context-menu" ref={menuRef} onClick={(e) => e.stopPropagation()}>
        
        <MenuHeader 
          addedCount={addedActivities.length} 
          onClose={handleClose} 
        />
        
        <div className="nested-menu-body">
          <MenuSearch 
            value={searchQuery} 
            onChange={setSearchQuery} 
          />
          
          <div className="nested-menu-primary">
            {filteredMenuData.root.items.length === 0 ? (
              <div className="no-search-results">
                <div className="no-results-icon">🔍</div>
                <div className="no-results-text">No activities found for "{searchQuery}"</div>
              </div>
            ) : (
              filteredMenuData.root.items.map(item => {
                const activity = getActivity(item.id);
                const activityStatus = activity?.status;
                
                return (
                  <MenuItem
                    key={item.id}
                    item={item}
                    isHovered={hoveredMenuId === item.id}
                    isSelected={selectedMenuId === item.id}
                    isActivityAdded={checkIsAdded(item.id)}
                    activityStatus={activityStatus}
                    onMouseEnter={() => setHoveredMenuId(item.id)}
                    onMouseLeave={() => {
                      if (selectedMenuId !== item.id) setHoveredMenuId(null);
                    }}
                    onClick={(e) => handlePrimaryItemClick(item, e)}
                  />
                );
              })
            )}
          </div>
          
          {/* Submenu */}
          <SubMenu
            subMenuData={subMenuData}
            activeMenuId={activeSubMenuId}
            getActivityByMenuItemId={getActivity}
            isActivityAdded={checkIsAdded}
            onSubItemClick={handleSubItemClick}
            onMouseEnter={() => { if (hoveredMenuId) setHoveredMenuId(hoveredMenuId); }}
            onMouseLeave={() => { if (!selectedMenuId) setHoveredMenuId(null); }}
          />
        </div>
        
        <div className="nested-menu-footer"></div>
      </div>
    </div>
  );
};

export default ActivityPopupMenu;
