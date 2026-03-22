/**
 * MenuHeader - Title bar and close button
 */
import React from 'react';
import { CounterBadge } from './StatusBadges';
import './MenuHeader.css';

/**
 * MenuHeader component
 * @param {number} addedCount - Number of activities in palette
 * @param {function} onClose - Function to close the menu
 */
const MenuHeader = ({ addedCount, onClose }) => {
  return (
    <div className="nested-menu-header">
      <div className="nested-menu-title">
        Add Activities
        {addedCount > 0 && (
          <CounterBadge count={addedCount} />
        )}
      </div>
      <button className="nested-menu-close" onClick={onClose}>&times;</button>
    </div>
  );
};

export default MenuHeader;
