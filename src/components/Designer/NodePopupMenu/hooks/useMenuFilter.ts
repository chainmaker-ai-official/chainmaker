import { useState, useEffect } from 'react';

export const useMenuFilter = (isVisible: boolean) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isVisible) setSearchQuery('');
  }, [isVisible]);

  return { searchQuery, setSearchQuery, hasSearch: searchQuery.trim().length > 0 };
};
