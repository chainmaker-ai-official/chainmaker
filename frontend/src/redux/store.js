import { configureStore } from '@reduxjs/toolkit';
import marketplaceReducer from './slices/marketplaceSlice.js';
import uiReducer from './slices/uiSlice.js';
import quizReducer from './slices/quizSlice.js';
import dropdownReducer from './slices/dropdownSlice.js';
import fillInTheBlanksReducer from './slices/fillInTheBlanksSlice.js';
import memoryGameReducer from './slices/memoryGameSlice.js';
import tableReducer from './slices/tableSlice.js';
import dialogReducer from './slices/dialogSlice.js';
import connectionsReducer from './slices/connectionsSlice.js';
import bangReducer from './slices/bangSlice.js';
import blockOutputsReducer from './slices/blockOutputsSlice.js';

export const store = configureStore({
  reducer: {
    marketplace: marketplaceReducer,
    ui: uiReducer,
    quiz: quizReducer,
    dropdown: dropdownReducer,
    fillInTheBlanks: fillInTheBlanksReducer,
    memoryGame: memoryGameReducer,
    table: tableReducer,
    dialog: dialogReducer,
    connections: connectionsReducer,
    bang: bangReducer,
    blockOutputs: blockOutputsReducer,
  },
});
