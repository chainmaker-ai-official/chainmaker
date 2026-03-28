import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAvailableNodes } from '../../services/apiService';

interface Node {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  subcategory: string;
  status: string;
  phase?: number;
  tags?: string[];
  color?: string;
}

interface NodeState {
  nodes: Node[];
  loading: boolean;
  error: string | null;
}

export const fetchNodesFromApi = createAsyncThunk(
  'node/fetchNodes',
  async () => {
    const nodes = await fetchAvailableNodes();
    return nodes;
  }
);

const initialState: NodeState = {
  nodes: [],
  loading: false,
  error: null,
};

const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    addNode: (state, action: PayloadAction<Node>) => {
      const node = action.payload;
      const exists = state.nodes.some(a => a.id === node.id);
      if (!exists) {
        state.nodes.push(node);
      }
    },
    removeNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      state.nodes = state.nodes.filter(node => node.id !== nodeId);
    },
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNodesFromApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNodesFromApi.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes = action.payload;
      })
      .addCase(fetchNodesFromApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch nodes';
      });
  },
});

export const { addNode, removeNode, setNodes } = nodeSlice.actions;

export const selectNodes = (state: any) => state.node.nodes;
export const selectIsNodeAdded = (nodeId: string) => (state: any) => 
  state.node.nodes.some((node: Node) => node.id === nodeId);

export default nodeSlice.reducer;
