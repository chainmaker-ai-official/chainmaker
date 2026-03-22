import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('fillInTheBlanksData');
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error('Failed to load fillInTheBlanks data from localStorage:', error);
    return {};
  }
};

// Save state to localStorage middleware
const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('fillInTheBlanksData', serializedState);
  } catch (error) {
    console.error('Failed to save fillInTheBlanks data to localStorage:', error);
  }
};

// Template data matching FillInTheBlanks component expectations
const getDefaultFillInTheBlanksData = () => {
  return {
    'fill-in-the-blanks': {
      title: 'Fill in the Blanks',
      prompts: [
        {
          sentence: 'The quick brown fox jumps over the <span class="word-drop-zone" id="blank1-drop"></span> dog.',
          blanks: {
            blank1: 'lazy'
          },
          tiles: {
            blank1: ['l', 'a', 'z', 'y']
          }
        },
        {
          sentence: 'Practice makes <span class="word-drop-zone" id="blank2-drop"></span>.',
          blanks: {
            blank2: 'perfect'
          },
          tiles: {
            blank2: ['p', 'e', 'r', 'f', 'e', 'c', 't']
          }
        }
      ]
    }
  };
};

const initialState = {
  // Key: blockId (e.g., "fill-in-the-blanks-11-123456789")
  // Value: { data: { 'fill-in-the-blanks': { ... } } }
  fillInTheBlanksData: loadStateFromLocalStorage(),
};

const fillInTheBlanksSlice = createSlice({
  name: 'fillInTheBlanks',
  initialState,
  reducers: {
    // Set fillInTheBlanks data for a specific block
    setFillInTheBlanksData: (state, action) => {
      const { blockId, data } = action.payload;
      state.fillInTheBlanksData[blockId] = { data };
      saveStateToLocalStorage(state.fillInTheBlanksData);
    },
    
    // Update fillInTheBlanks data for a specific block
    updateFillInTheBlanksData: (state, action) => {
      const { blockId, data } = action.payload;
      if (state.fillInTheBlanksData[blockId]) {
        state.fillInTheBlanksData[blockId].data = data;
      } else {
        state.fillInTheBlanksData[blockId] = { data };
      }
      saveStateToLocalStorage(state.fillInTheBlanksData);
    },
    
    // Get or initialize fillInTheBlanks data for a block
    initializeFillInTheBlanksData: (state, action) => {
      const { blockId } = action.payload;
      if (!state.fillInTheBlanksData[blockId]) {
        state.fillInTheBlanksData[blockId] = { data: getDefaultFillInTheBlanksData() };
        saveStateToLocalStorage(state.fillInTheBlanksData);
      }
    },
    
    // Remove fillInTheBlanks data for a block
    removeFillInTheBlanksData: (state, action) => {
      const { blockId } = action.payload;
      delete state.fillInTheBlanksData[blockId];
      saveStateToLocalStorage(state.fillInTheBlanksData);
    },
    
    // Clear all fillInTheBlanks data
    clearAllFillInTheBlanksData: (state) => {
      state.fillInTheBlanksData = {};
      saveStateToLocalStorage(state.fillInTheBlanksData);
    },
  },
});

export const { 
  setFillInTheBlanksData, 
  updateFillInTheBlanksData, 
  initializeFillInTheBlanksData,
  removeFillInTheBlanksData,
  clearAllFillInTheBlanksData 
} = fillInTheBlanksSlice.actions;

// Selectors
export const selectFillInTheBlanksData = (state) => state.fillInTheBlanks.fillInTheBlanksData;
export const selectFillInTheBlanksDataByBlockId = (blockId) => (state) => 
  state.fillInTheBlanks.fillInTheBlanksData[blockId]?.data || getDefaultFillInTheBlanksData();
export const selectHasFillInTheBlanksData = (blockId) => (state) => 
  !!state.fillInTheBlanks.fillInTheBlanksData[blockId];

export default fillInTheBlanksSlice.reducer;