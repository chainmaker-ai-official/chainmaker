import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Store Bang trigger events: { [logBlockId]: { sourceBlockId, label, timestamp } }
  triggers: {},
  // Counter to force re-render when Bang is clicked
  triggerCount: 0,
};

const bangSlice = createSlice({
  name: 'bang',
  initialState,
  reducers: {
    // Trigger Bang - update the trigger data and increment counter
    triggerBang: (state, action) => {
      const { targetLogId, sourceBlockId, label } = action.payload;
      state.triggers[targetLogId] = {
        sourceBlockId,
        label,
        timestamp: new Date().toISOString(),
      };
      state.triggerCount += 1;
    },
    
    // Clear all Bang triggers
    clearBangTriggers: (state) => {
      state.triggers = {};
      state.triggerCount = 0;
    },
    
    // Clear a specific Bang trigger
    clearBangTrigger: (state, action) => {
      const targetLogId = action.payload;
      delete state.triggers[targetLogId];
    },
  },
});

export const { triggerBang, clearBangTriggers, clearBangTrigger } = bangSlice.actions;

// Selectors
export const selectBangTriggers = (state) => state.bang.triggers;
export const selectBangTriggerCount = (state) => state.bang.triggerCount;
export const selectBangTriggerForBlock = (blockId) => (state) => state.bang.triggers[blockId];

export default bangSlice.reducer;
