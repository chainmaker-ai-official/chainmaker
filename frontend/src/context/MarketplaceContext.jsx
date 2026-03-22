import React, { createContext, useState, useContext, useEffect } from 'react';

const MarketplaceContext = createContext();

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};

export const MarketplaceProvider = ({ children }) => {
  const [marketplaceActivities, setMarketplaceActivities] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedActivities = localStorage.getItem('marketplaceActivities');
    if (savedActivities) {
      try {
        setMarketplaceActivities(JSON.parse(savedActivities));
      } catch (error) {
        console.error('Failed to parse saved marketplace activities:', error);
      }
    }
  }, []);

  // Save to localStorage whenever activities change
  useEffect(() => {
    localStorage.setItem('marketplaceActivities', JSON.stringify(marketplaceActivities));
  }, [marketplaceActivities]);

  const addMarketplaceActivity = (activity) => {
    // Check if activity already exists
    const exists = marketplaceActivities.some(a => a.id === activity.id);
    if (!exists) {
      setMarketplaceActivities(prev => [...prev, activity]);
      return true;
    }
    return false;
  };

  const removeMarketplaceActivity = (activityId) => {
    setMarketplaceActivities(prev => prev.filter(activity => activity.id !== activityId));
  };

  const isActivityAdded = (activityId) => {
    return marketplaceActivities.some(activity => activity.id === activityId);
  };

  const value = {
    marketplaceActivities,
    addMarketplaceActivity,
    removeMarketplaceActivity,
    isActivityAdded,
    setMarketplaceActivities // Keep for backward compatibility
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};