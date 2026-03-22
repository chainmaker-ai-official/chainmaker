/**
 * SubMenu - The floating submenu column
 */
import React from 'react';
import MenuItem from './MenuItem';
import './SubMenu.css';

/**
 * SubMenu component
 * @param {object} subMenuData - The submenu data object
 * @param {string} activeMenuId - The currently active/howered menu ID
 * @param {function} getActivityByMenuItemId - Function to get activity by menu item ID
 * @param {function} isActivityAdded - Function to check if activity is added
 * @param {function} onSubItemClick - Click handler for submenu items
 * @param {function} onMouseEnter - Mouse enter handler
 * @param {function} onMouseLeave - Mouse leave handler
 */
const SubMenu = ({
  subMenuData,
  activeMenuId,
  getActivityByMenuItemId,
  isActivityAdded,
  onSubItemClick,
  onMouseEnter,
  onMouseLeave
}) => {
  if (!subMenuData || !activeMenuId) return null;

  return (
    <div 
      className="nested-menu-submenu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="nested-submenu-header">
        <div className="nested-submenu-title">{subMenuData.title}</div>
      </div>
      <div className="nested-submenu-body">
        {subMenuData.items.map(subItem => {
          const activity = getActivityByMenuItemId(subItem.id);
          const activityStatus = activity?.status;
          
          return (
            <MenuItem
              key={subItem.id}
              item={subItem}
              isHovered={false}
              isSelected={false}
              isActivityAdded={isActivityAdded(subItem.id)}
              activityStatus={activityStatus}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
              onClick={(e) => onSubItemClick(subItem.id, e)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SubMenu;
