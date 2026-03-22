import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('dialogData');
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error('Failed to load dialog data from localStorage:', error);
    return {};
  }
};

// Save state to localStorage middleware
const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('dialogData', serializedState);
  } catch (error) {
    console.error('Failed to save dialog data to localStorage:', error);
  }
};

// Template data matching Dialog component expectations
const getDefaultDialogData = () => {
  return {
    title: "Dialog Practice",
    characters: {
      speaker_1: {
        name: "Anna",
        emoji: "👧"
      },
      speaker_2: {
        name: "Ben", 
        emoji: "👦"
      },
      robot: {
        name: "Bot",
        emoji: "🤖"
      }
    },
    conversations: [
      {
        title: "Sample Conversation",
        lines: [
          {
            speaker: "speaker_1",
            text: "Hello! How are you today?"
          },
          {
            speaker: "speaker_2", 
            text: "I'm doing great, thank you!"
          }
        ]
      }
    ]
  };
};

const initialState = {
  // Key: blockId (e.g., "dialog-13-123456789")
  // Value: { data: { ...dialogData } }
  dialogData: loadStateFromLocalStorage(),
};

const dialogSlice = createSlice({
  name: 'dialog',
  initialState,
  reducers: {
    // Set dialog data for a specific block
    setDialogData: (state, action) => {
      const { blockId, data } = action.payload;
      state.dialogData[blockId] = { data };
      saveStateToLocalStorage(state.dialogData);
    },
    
    // Update dialog data for a specific block
    updateDialogData: (state, action) => {
      const { blockId, data } = action.payload;
      if (state.dialogData[blockId]) {
        state.dialogData[blockId].data = data;
      } else {
        state.dialogData[blockId] = { data };
      }
      saveStateToLocalStorage(state.dialogData);
    },
    
    // Get or initialize dialog data for a block
    initializeDialogData: (state, action) => {
      const { blockId } = action.payload;
      if (!state.dialogData[blockId]) {
        state.dialogData[blockId] = { data: getDefaultDialogData() };
        saveStateToLocalStorage(state.dialogData);
      }
    },
    
    // Remove dialog data for a block
    removeDialogData: (state, action) => {
      const { blockId } = action.payload;
      delete state.dialogData[blockId];
      saveStateToLocalStorage(state.dialogData);
    },
    
    // Clear all dialog data
    clearAllDialogData: (state) => {
      state.dialogData = {};
      saveStateToLocalStorage(state.dialogData);
    },
  },
});

export const { 
  setDialogData, 
  updateDialogData, 
  initializeDialogData,
  removeDialogData,
  clearAllDialogData 
} = dialogSlice.actions;

// Selectors
export const selectDialogData = (state) => state.dialog.dialogData;
export const selectDialogDataByBlockId = (blockId) => (state) => 
  state.dialog.dialogData[blockId]?.data || getDefaultDialogData();
export const selectHasDialogData = (blockId) => (state) => 
  !!state.dialog.dialogData[blockId];

export default dialogSlice.reducer;