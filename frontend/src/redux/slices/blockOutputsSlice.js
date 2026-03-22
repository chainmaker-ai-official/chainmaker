import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Store block outputs: { [blockId]: { value, timestamp, type, raw } }
  outputs: {},
};

const blockOutputsSlice = createSlice({
  name: 'blockOutputs',
  initialState,
  reducers: {
    // Set block output - called when a block produces data (e.g., UniswapRouter fetches price)
    setBlockOutput: (state, action) => {
      const { blockId, value, type, raw } = action.payload;
      state.outputs[blockId] = {
        value,
        type: type || 'unknown',
        raw,
        timestamp: new Date().toISOString(),
      };
    },
    
    // Clear a specific block's output
    clearBlockOutput: (state, action) => {
      const blockId = action.payload;
      delete state.outputs[blockId];
    },
    
    // Clear all block outputs
    clearAllBlockOutputs: (state) => {
      state.outputs = {};
    },
  },
});

export const { setBlockOutput, clearBlockOutput, clearAllBlockOutputs } = blockOutputsSlice.actions;

// Selectors
export const selectBlockOutputs = (state) => state.blockOutputs.outputs;
export const selectBlockOutput = (blockId) => (state) => state.blockOutputs.outputs[blockId];
export const selectBlockOutputValue = (blockId) => (state) => state.blockOutputs.outputs[blockId]?.value;

export default blockOutputsSlice.reducer;