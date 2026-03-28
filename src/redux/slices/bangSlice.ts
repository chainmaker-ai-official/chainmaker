import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BangTrigger {
  sourceNodeId: string;
  label: string;
  timestamp: string;
}

interface BangState {
  triggers: Record<string, BangTrigger>;
  triggerCount: number;
}

const initialState: BangState = {
  triggers: {},
  triggerCount: 0,
};

const bangSlice = createSlice({
  name: 'bang',
  initialState,
  reducers: {
    triggerBang: (state, action: PayloadAction<{ targetLogId: string; sourceNodeId: string; label: string }>) => {
      const { targetLogId, sourceNodeId, label } = action.payload;
      state.triggers[targetLogId] = {
        sourceNodeId,
        label,
        timestamp: new Date().toISOString(),
      };
      state.triggerCount += 1;
    },
    clearBangTriggers: (state) => {
      state.triggers = {};
      state.triggerCount = 0;
    },
    clearBangTrigger: (state, action: PayloadAction<string>) => {
      const targetLogId = action.payload;
      delete state.triggers[targetLogId];
    },
  },
});

export const { triggerBang, clearBangTriggers, clearBangTrigger } = bangSlice.actions;

export const selectBangTriggers = (state: any) => state.bang.triggers;
export const selectBangTriggerCount = (state: any) => state.bang.triggerCount;
export const selectBangTriggerForNode = (nodeId: string) => (state: any) => state.bang.triggers[nodeId];

export default bangSlice.reducer;
