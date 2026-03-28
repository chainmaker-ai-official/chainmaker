import { configureStore } from '@reduxjs/toolkit';
import nodeReducer from './slices/nodeSlice';
import connectionsReducer from './slices/connectionsSlice';
import bangReducer from './slices/bangSlice';
import nodeOutputsReducer from './slices/nodeOutputsSlice';

export const store = configureStore({
  reducer: {
    node: nodeReducer,
    connections: connectionsReducer,
    bang: bangReducer,
    nodeOutputs: nodeOutputsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
