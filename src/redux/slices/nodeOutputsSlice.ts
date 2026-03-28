import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NodeOutput {
  value: any;
  type: string;
  raw: any;
  timestamp: string;
}

interface NodeOutputsState {
  outputs: Record<string, NodeOutput>;
}

const initialState: NodeOutputsState = {
  outputs: {},
};

const nodeOutputsSlice = createSlice({
  name: 'nodeOutputs',
  initialState,
  reducers: {
    setNodeOutput: (state, action: PayloadAction<{ nodeId: string; value: any; type?: string; raw: any }>) => {
      const { nodeId, value, type, raw } = action.payload;
      state.outputs[nodeId] = {
        value,
        type: type || 'unknown',
        raw,
        timestamp: new Date().toISOString(),
      };
    },
    clearNodeOutput: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      delete state.outputs[nodeId];
    },
    clearAllNodeOutputs: (state) => {
      state.outputs = {};
    },
  },
});

export const { setNodeOutput, clearNodeOutput, clearAllNodeOutputs } = nodeOutputsSlice.actions;

export const selectNodeOutputs = (state: any) => state.nodeOutputs.outputs;
export const selectNodeOutput = (nodeId: string) => (state: any) => state.nodeOutputs.outputs[nodeId];
export const selectNodeOutputValue = (nodeId: string) => (state: any) => state.nodeOutputs.outputs[nodeId]?.value;

export default nodeOutputsSlice.reducer;
