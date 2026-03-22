import { createSlice } from '@reduxjs/toolkit';

const memoryGameSlice = createSlice({
  name: 'memoryGame',
  initialState: {
    // Store data by blockId: { blockId: { 'matching-pairs': [...] } }
    dataByBlockId: {}
  },
  reducers: {
    // Initialize memory game data for a block
    initializeMemoryGameData: (state, action) => {
      const { blockId } = action.payload;
      if (!state.dataByBlockId[blockId]) {
        state.dataByBlockId[blockId] = {
          'matching-pairs': [
            ["Hello", "你好"],
            ["Thank you", "谢谢"],
            ["Goodbye", "再见"],
            ["Please", "请"],
            ["Sorry", "对不起"]
          ]
        };
      }
    },
    
    // Update memory game data for a block
    updateMemoryGameData: (state, action) => {
      const { blockId, data } = action.payload;
      state.dataByBlockId[blockId] = data;
    },
    
    // Clear memory game data for a block
    clearMemoryGameData: (state, action) => {
      const { blockId } = action.payload;
      delete state.dataByBlockId[blockId];
    }
  }
});

// Export actions
export const { 
  initializeMemoryGameData, 
  updateMemoryGameData, 
  clearMemoryGameData 
} = memoryGameSlice.actions;

// Export selectors
export const selectMemoryGameDataByBlockId = (blockId) => (state) => 
  state.memoryGame.dataByBlockId[blockId] || null;

export const selectAllMemoryGameData = (state) => 
  state.memoryGame.dataByBlockId;

// Export reducer
export default memoryGameSlice.reducer;