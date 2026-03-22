/**
 * Hook for managing search and category filtering state
 */
import { useState, useEffect } from 'react';

/**
 * Menu filter hook - handles search state
 * @param {boolean} isVisible - Whether the menu is visible
 * @returns {object} - { searchQuery, setSearchQuery, clearSearch }
 */
export const useMenuFilter = (isVisible) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Clear search when menu becomes hidden
  useEffect(() => {
    if (!isVisible) {
      setSearchQuery('');
    }
  }, [isVisible]);

  // Clear search helper
  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    hasSearch: searchQuery.trim().length > 0
  };
};
