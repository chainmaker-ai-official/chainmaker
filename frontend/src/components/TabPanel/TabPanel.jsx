import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { togglePanel as togglePanelAction, selectActivePanel } from '../../redux/slices/uiSlice';
import './TabPanel.css';

/**
 * Unified TabPanel component that supports both local and Redux state management,
 * multiple positioning modes, and configurable content.
 * 
 * @param {Object} props
 * @param {boolean} props.useRedux - Whether to use Redux for state management (default: false)
 * @param {Array} props.tabs - Configuration for tabs
 * @param {Array} props.panels - Configuration for panels
 * @param {boolean} props.showCloseButton - Whether to show close button in panels (default: false)
 * @param {boolean} props.hideTabsWhenDesignerActive - Whether to hide other tabs when Designer is active (default: false)
 * @param {boolean} props.simplePositioning - Use simpler sidebar positioning mode (default: false)
 * @param {string} props.designerPanelId - ID of the designer panel for special handling (default: 'panel-3')
 * @param {Function} props.onPanelToggle - Callback when panel is toggled
 */
const TabPanel = ({
  useRedux = false,
  tabs = [
    { id: 'tab-dashboard', target: 'panel-dashboard', label: 'DASHBOARD', side: 'left', originalLeft: 0 },
    { id: 'tab-1', target: 'panel-1', label: 'PROJECTS AND TOOLS', side: 'right', originalRight: 60 },
    { id: 'tab-2', target: 'panel-2', label: 'MARKETPLACE', side: 'right', originalRight: 30 },
    { id: 'tab-3', target: 'panel-3', label: 'DESIGNER', side: 'right', originalRight: 0 }
  ],
  panels = [
    { id: 'panel-1', title: 'PROJECTS', content: 'This panel shows an overview of active projects.' },
    { id: 'panel-2', title: 'MARKETPLACE', content: 'Marketplace content goes here.' },
    { id: 'panel-3', title: 'DESIGNER', content: 'Designer content goes here.' }
  ],
  showCloseButton = false,
  hideTabsWhenDesignerActive = false,
  simplePositioning = false,
  designerPanelId = 'panel-3',
  onPanelToggle = () => {}
}) => {
  // Redux hooks
  const dispatch = useDispatch();
  const reduxActivePanel = useSelector(selectActivePanel);
  
  // Local state hooks
  const [localActivePanel, setLocalActivePanel] = useState(null);
  const [tabPositions, setTabPositions] = useState({});
  const tabRefs = useRef({});
  
  // Determine active panel based on state management mode
  const activePanel = useRedux ? reduxActivePanel : localActivePanel;
  
  // Helper function to set active panel based on mode
  const setActivePanel = (panelId) => {
    if (useRedux) {
      dispatch(togglePanelAction(panelId));
    } else {
      setLocalActivePanel(panelId);
    }
    onPanelToggle(panelId);
  };
  
  const togglePanel = (panelId) => {
    // Special handling for dashboard tab - just close any open panel
    if (panelId === 'panel-dashboard') {
      setActivePanel(null);
      setTabPositions({});
      return;
    }
    
    if (activePanel === panelId) {
      setActivePanel(null);
      // Reset all tab positions when closing
      setTabPositions({});
    } else {
      setActivePanel(panelId);
      
      // Find the active tab
      const activeTab = tabs.find(tab => tab.target === panelId);
      if (activeTab && activeTab.side === 'right') {
        // Special case: when Designer is active and hideTabsWhenDesignerActive is true
        if (hideTabsWhenDesignerActive && panelId === designerPanelId) {
          setTabPositions({});
        } else if (!simplePositioning) {
          // Complex positioning: shift tabs that are to the right of the active tab
          const tabWidth = 30;
          const newPositions = {};
          
          tabs.forEach(tab => {
            if (tab.side === 'right' && tab.id !== activeTab.id && tab.originalRight > activeTab.originalRight) {
              newPositions[tab.id] = tab.originalRight - tabWidth;
            }
          });
          
          setTabPositions(newPositions);
        } else {
          // Simple positioning: no shifting
          setTabPositions({});
        }
      }
    }
  };

  const closePanel = () => {
    setActivePanel(null);
    setTabPositions({});
  };

  // Update CSS variables via useEffect
  useEffect(() => {
    const tabWidth = 30;
    const numTabs = tabs.filter(tab => tab.side === 'right').length;
    const totalTabWidth = tabWidth * numTabs;
    const slideDistance = `calc(100vw - ${totalTabWidth}px)`;
    
    document.documentElement.style.setProperty('--tab-width', `${tabWidth}px`);
    document.documentElement.style.setProperty('--num-tabs', numTabs);
    document.documentElement.style.setProperty('--total-tab-width', `${totalTabWidth}px`);
    document.documentElement.style.setProperty('--slide-distance', slideDistance);
  }, [tabs]);

  // Update tab positions when activePanel changes (for Redux mode)
  useEffect(() => {
    if (!activePanel) {
      setTabPositions({});
      return;
    }
    
    const activeTab = tabs.find(tab => tab.target === activePanel);
    if (activeTab && activeTab.side === 'right') {
      // Special case: when Designer is active and hideTabsWhenDesignerActive is true
      if (hideTabsWhenDesignerActive && activePanel === designerPanelId) {
        setTabPositions({});
      } else if (!simplePositioning && useRedux) {
        // Complex positioning for Redux mode
        const tabWidth = 30;
        const newPositions = {};
        
        tabs.forEach(tab => {
          if (tab.side === 'right' && tab.id !== activeTab.id && tab.originalRight > activeTab.originalRight) {
            newPositions[tab.id] = tab.originalRight - tabWidth;
          }
        });
        
        setTabPositions(newPositions);
      }
    } else {
      setTabPositions({});
    }
  }, [activePanel, tabs, hideTabsWhenDesignerActive, designerPanelId, simplePositioning, useRedux]);

  // Determine which tab gets the stemmed shape
  let stemmedId = null;
  if (activePanel === null) {
    stemmedId = 'tab-dashboard';
  } else {
    const activeTab = tabs.find(tab => tab.target === activePanel);
    if (activeTab) {
      stemmedId = activeTab.id;
    }
  }

  // Check if Designer is active for tab hiding logic
  const isDesignerActive = hideTabsWhenDesignerActive && activePanel === designerPanelId;
  
  // Hide dashboard tab when dashboard is open (activePanel === null)
  const shouldHideDashboardTab = activePanel === null;

  return (
    <div className="tabs-panel-container">
      {/* Tabs */}
      {tabs.map((tab) => {
        const isActive = activePanel === tab.target;
        const isInactive = activePanel && !isActive && tab.id !== 'tab-dashboard';
        const isHidden = isDesignerActive && tab.side === 'right';
        
        // Check if we should hide the dashboard tab
        const hideDashboardTab = shouldHideDashboardTab && tab.id === 'tab-dashboard';
        
        let style = {};
        if (tab.side === 'left') {
          style = { left: `${tab.originalLeft}px` };
        } else {
          const rightPosition = tabPositions[tab.id] !== undefined ? tabPositions[tab.id] : tab.originalRight;
          style = { right: `${rightPosition}px` };
        }
        
        const tabClasses = [
          'panel-tab',
          isActive ? 'is-active' : '',
          isInactive ? 'tab-inactive' : '',
          tab.id === stemmedId ? 'stemmed-shape' : '',
          isHidden ? 'tab-hidden' : '',
          hideDashboardTab ? 'tab-hidden' : '',
          simplePositioning && isActive ? 'sidebar-mode' : ''
        ].filter(Boolean).join(' ');
        
        return (
          <button
            key={tab.id}
            id={tab.id}
            className={tabClasses}
            onClick={() => togglePanel(tab.target)}
            data-target={tab.target}
            ref={el => tabRefs.current[tab.id] = el}
            style={style}
          >
            <span>{tab.label}</span>
          </button>
        );
      })}

      {/* Panels */}
      {panels.map((panel) => {
        const panelClasses = [
          'sliding-panel',
          activePanel === panel.id ? 'is-open' : '',
          simplePositioning ? 'sidebar-mode' : ''
        ].filter(Boolean).join(' ');
        
        return (
          <div
            key={panel.id}
            id={panel.id}
            className={panelClasses}
          >
            {panel.title && <h1>{panel.title}</h1>}
            {typeof panel.content === 'string' ? (
              <p>{panel.content}</p>
            ) : (
              panel.content
            )}
            {showCloseButton && activePanel === panel.id && (
              <button onClick={closePanel} className="close-btn">
                Close Panel
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TabPanel;