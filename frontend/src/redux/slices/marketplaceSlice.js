import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('marketplaceActivities');
    if (serializedState === null) {
      return [];
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error('Failed to load marketplace activities from localStorage:', error);
    return [];
  }
};

// Save state to localStorage middleware
const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('marketplaceActivities', serializedState);
  } catch (error) {
    console.error('Failed to save marketplace activities to localStorage:', error);
  }
};

const initialState = {
  activities: loadStateFromLocalStorage(),
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    addActivity: (state, action) => {
      const activity = action.payload;
      const exists = state.activities.some(a => a.id === activity.id);
      if (!exists) {
        state.activities.push(activity);
        saveStateToLocalStorage(state.activities);
      }
    },
    removeActivity: (state, action) => {
      const activityId = action.payload;
      state.activities = state.activities.filter(activity => activity.id !== activityId);
      saveStateToLocalStorage(state.activities);
    },
    setActivities: (state, action) => {
      state.activities = action.payload;
      saveStateToLocalStorage(state.activities);
    },
  },
});

export const { addActivity, removeActivity, setActivities } = marketplaceSlice.actions;

// Selectors
export const selectMarketplaceActivities = (state) => state.marketplace.activities;
export const selectIsActivityAdded = (activityId) => (state) => 
  state.marketplace.activities.some(activity => activity.id === activityId);

export default marketplaceSlice.reducer;