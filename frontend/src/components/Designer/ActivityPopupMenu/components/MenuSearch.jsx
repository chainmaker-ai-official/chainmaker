/**
 * MenuSearch - Search input logic
 */
import React from 'react';
import './MenuSearch.css';

/**
 * MenuSearch component
 * @param {string} value - Current search value
 * @param {function} onChange - Function to handle search input change
 */
const MenuSearch = ({ value, onChange }) => {
  return (
    <div className="nested-menu-search-section">
      <input
        type="text"
        placeholder="Search activities..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default MenuSearch;
