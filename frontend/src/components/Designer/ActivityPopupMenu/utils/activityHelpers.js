/**
 * Utility functions for activity lookup and status checking
 * Values aligned with src/assets/structure.json
 */
import structureData from '../../../../assets/structure.json';

/**
 * Get activity object by menu item ID
 * @param {string} menuItemId - The menu item ID
 * @param {object} activityIdMap - Mapping of menu item IDs to activity IDs
 * @param {array} marketplaceActivities - List of activities from marketplace
 * @returns {object|null} - Activity object or null if not found
 */
export const getActivityByMenuItemId = (menuItemId, activityIdMap, marketplaceActivities) => {
  const activityId = activityIdMap[menuItemId];
  
  // First look in marketplaceActivities
  let activity = marketplaceActivities.find(activity => activity.id === activityId);
  
  // If not found, look in structure.json trading_modules
  if (!activity && structureData && structureData.trading_modules) {
    activity = structureData.trading_modules.find(activity => 
      activity.id === activityId || 
      activity.title.toLowerCase().replace(/[\s/]+/g, '-') === menuItemId
    );
  }
  
  return activity || null;
};

/**
 * Check if an activity is already added to the palette
 * @param {string} menuItemId - The menu item ID
 * @param {object} activityIdMap - Mapping of menu item IDs to activity IDs
 * @param {array} marketplaceActivities - List of activities from marketplace
 * @param {array} addedActivities - List of already added activities
 * @returns {boolean} - True if activity is already added
 */
export const isActivityAdded = (menuItemId, activityIdMap, marketplaceActivities, addedActivities) => {
  const activity = getActivityByMenuItemId(menuItemId, activityIdMap, marketplaceActivities);
  if (!activity) return false;
  return addedActivities.some(a => a.id === activity.id);
};

/**
 * Get all activities from structure.json
 * @returns {array} - Array of trading modules from structure.json
 */
export const getStructureActivities = () => {
  return structureData?.trading_modules || [];
};

/**
 * Get activities by category from structure.json
 * @param {string} category - The category name
 * @returns {array} - Array of activities in that category
 */
export const getActivitiesByCategory = (category) => {
  const modules = structureData?.trading_modules || [];
  return modules.filter(module => module.category === category);
};
