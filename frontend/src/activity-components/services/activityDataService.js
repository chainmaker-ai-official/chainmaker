import structureData from '../../assets/structure.json';

// Import activity components

import Generic from '../activities/Generic';

// Map component names to actual components
const componentMap = {
  'Generic': Generic
};

/**
 * Get all activities with their component references resolved
 * @returns {Array} Array of activity objects with React components
 */
export function getActivities() {
  // Get enabled activities
  const enabledActivities = structureData.activities.filter(activity => activity.enabled !== false);
  
  // Apply layout order if specified
  let orderedActivities = [...enabledActivities];
  if (structureData.layout && structureData.layout.order && Array.isArray(structureData.layout.order)) {
    const order = structureData.layout.order;
    
    // Sort activities according to layout order
    orderedActivities.sort((a, b) => {
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      
      // If both IDs are in the order array, sort by their positions
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only A is in the order array, A comes first
      if (indexA !== -1) {
        return -1;
      }
      
      // If only B is in the order array, B comes first
      if (indexB !== -1) {
        return 1;
      }
      
      // If neither is in the order array, maintain original order
      return 0;
    });
  }
  
  return orderedActivities.map(activity => ({
    ...activity,
    component: componentMap[activity.component] || Generic // Fallback to Generic if component not found
  }));
}

/**
 * Get a specific activity by ID
 * @param {string} activityId - The ID of the activity to retrieve
 * @returns {Object|null} Activity object or null if not found
 */
export function getActivityById(activityId) {
  const activity = structureData.activities.find(a => a.id === activityId);
  if (!activity || activity.enabled === false) {
    return null;
  }
  
  return {
    ...activity,
    component: componentMap[activity.component] || Generic
  };
}

/**
 * Get only enabled activity IDs
 * @returns {Array} Array of enabled activity IDs
 */
export function getEnabledActivityIds() {
  const activities = getActivities();
  return activities.map(activity => activity.id);
}

/**
 * Get the component for a specific activity
 * @param {string} activityId - The ID of the activity
 * @returns {React.Component|null} React component or null if not found
 */
export function getActivityComponent(activityId) {
  const activity = getActivityById(activityId);
  return activity ? activity.component : null;
}

/**
 * Get props for a specific activity
 * @param {string} activityId - The ID of the activity
 * @returns {Object} Props object (empty object if not found)
 */
export function getActivityProps(activityId) {
  const activity = getActivityById(activityId);
  return activity ? activity.props : {};
}

/**
 * Get all activities in the raw JSON format (without component resolution)
 * @returns {Array} Raw activity data from JSON
 */
export function getRawActivities() {
  return [...structureData.activities];
}

/**
 * Get activity metadata (id, label, icon) for display purposes
 * @returns {Array} Array of activity metadata objects
 */
export function getActivityMetadata() {
  const activities = getActivities();
  return activities.map(({ id, label, icon, description }) => ({
    id,
    label,
    icon,
    description
  }));
}

// Default export for backward compatibility
export default {
  getActivities,
  getActivityById,
  getEnabledActivityIds,
  getActivityComponent,
  getActivityProps,
  getRawActivities,
  getActivityMetadata
};