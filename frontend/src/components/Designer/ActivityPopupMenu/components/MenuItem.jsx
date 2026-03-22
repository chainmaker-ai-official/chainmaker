/**
 * MenuItem - Logic for individual rows (hover/click)
 */
import React from 'react';
import { StatusBadges } from './StatusBadges';
import './MenuItem.css';

/**
 * MenuItem component
 * @param {object} item - The menu item data
 * @param {boolean} isHovered - Whether the item is hovered
 * @param {boolean} isSelected - Whether the item is selected
 * @param {boolean} isActivityAdded - Whether the activity is already added
 * @param {string} activityStatus - Activity status (e.g., 'coming-soon')
 * @param {function} onMouseEnter - Mouse enter handler
 * @param {function} onMouseLeave - Mouse leave handler
 * @param {function} onClick - Click handler
 */
const MenuItem = ({
  item,
  isHovered,
  isSelected,
  isActivityAdded,
  activityStatus,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  return (
    <div
      className={`nested-menu-item ${item.type} ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''} ${activityStatus === 'coming-soon' ? 'coming-soon' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div className="nested-menu-item-icon">{item.icon}</div>
      <div className="nested-menu-item-text">{item.name}</div>
      {isActivityAdded ? (
        <StatusBadges isAdded={true} status={null} />
      ) : item.type === 'category' ? (
        <div className="nested-menu-item-arrow">›</div>
      ) : activityStatus === 'coming-soon' ? (
        <StatusBadges isAdded={false} status="coming-soon" />
      ) : null}
    </div>
  );
};

export default MenuItem;
