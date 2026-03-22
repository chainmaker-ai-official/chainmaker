import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('dropdownData');
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error('Failed to load dropdown data from localStorage:', error);
    return {};
  }
};

// Save state to localStorage middleware
const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('dropdownData', serializedState);
  } catch (error) {
    console.error('Failed to save dropdown data to localStorage:', error);
  }
};

// Template data matching Dropdown component expectations
const getDefaultDropdownData = () => {
  return {
    "Category 1": [
      "Item 1 - Description 1",
      "Item 2 - Description 2",
      "Item 3 - Description 3"
    ],
    "Category 2": [
      "Apple - Red fruit",
      "Banana - Yellow fruit",
      "Cherry - Small red fruit"
    ]
  };
};

const initialState = {
  // Key: blockId (e.g., "dropdown-11-123456789")
  // Value: { data: { "dropdown-sets": { ... } } }
  dropdownData: loadStateFromLocalStorage(),
};

const dropdownSlice = createSlice({
  name: 'dropdown',
  initialState,
  reducers: {
    // Set dropdown data for a specific block
    setDropdownData: (state, action) => {
      const { blockId, data } = action.payload;
      state.dropdownData[blockId] = { data };
      saveStateToLocalStorage(state.dropdownData);
    },
    
    // Update dropdown data for a specific block
    updateDropdownData: (state, action) => {
      const { blockId, data } = action.payload;
      if (state.dropdownData[blockId]) {
        state.dropdownData[blockId].data = data;
      } else {
        state.dropdownData[blockId] = { data };
      }
      saveStateToLocalStorage(state.dropdownData);
    },
    
    // Get or initialize dropdown data for a block
    initializeDropdownData: (state, action) => {
      const { blockId } = action.payload;
      if (!state.dropdownData[blockId]) {
        state.dropdownData[blockId] = { data: getDefaultDropdownData() };
        saveStateToLocalStorage(state.dropdownData);
      }
    },
    
    // Remove dropdown data for a block
    removeDropdownData: (state, action) => {
      const { blockId } = action.payload;
      delete state.dropdownData[blockId];
      saveStateToLocalStorage(state.dropdownData);
    },
    
    // Clear all dropdown data
    clearAllDropdownData: (state) => {
      state.dropdownData = {};
      saveStateToLocalStorage(state.dropdownData);
    },
  },
});

export const { 
  setDropdownData, 
  updateDropdownData, 
  initializeDropdownData,
  removeDropdownData,
  clearAllDropdownData 
} = dropdownSlice.actions;

// Selectors
export const selectDropdownData = (state) => state.dropdown.dropdownData;
export const selectDropdownDataByBlockId = (blockId) => (state) => 
  state.dropdown.dropdownData[blockId]?.data || getDefaultDropdownData();
export const selectHasDropdownData = (blockId) => (state) => 
  !!state.dropdown.dropdownData[blockId];

export default dropdownSlice.reducer;