/**
 * StatusBadges - Small components for 'Added', 'Soon', 'Counter' badges
 */
import React from 'react';
import './StatusBadges.css';

/**
 * Badge shown when an activity has been added to palette
 */
export const AddedBadge = () => (
  <div className="status-badge added">Added</div>
);

/**
 * Badge shown when an activity is coming soon
 */
export const SoonBadge = () => (
  <div className="status-badge soon">Soon</div>
);

/**
 * Counter badge showing number of added activities
 * @param {number} count - Number of activities in palette
 */
export const CounterBadge = ({ count }) => (
  <span className="session-counter-badge">{count} in palette</span>
);

/**
 * StatusBadges component - renders appropriate badge based on status
 * @param {boolean} isAdded - Whether the activity is already added
 * @param {string} status - Activity status (e.g., 'coming-soon')
 */
export const StatusBadges = ({ isAdded, status }) => {
  if (isAdded) {
    return <AddedBadge />;
  }
  
  if (status === 'coming-soon') {
    return <SoonBadge />;
  }
  
  return null;
};

export default StatusBadges;
