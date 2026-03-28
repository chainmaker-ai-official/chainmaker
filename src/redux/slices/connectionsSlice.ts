import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePort: string;
  targetPort: string;
  sourceOffset?: { x: number; y: number };
  targetOffset?: { x: number; y: number };
}

interface ConnectionsState {
  connections: Connection[];
  connectedNodes: Record<string, boolean>;
}

const initialState: ConnectionsState = {
  connections: [],
  connectedNodes: {},
};

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    addConnection: (state, action: PayloadAction<Connection>) => {
      const { id, sourceId, targetId, sourcePort = 'output', targetPort = 'input' } = action.payload;
      
      const exists = state.connections.some(
        conn => conn.sourceId === sourceId && conn.targetId === targetId && conn.sourcePort === sourcePort && conn.targetPort === targetPort
      );
      
      if (!exists) {
        state.connections.push(action.payload);
        state.connectedNodes[sourceId] = true;
        state.connectedNodes[targetId] = true;
      }
    },
    removeConnection: (state, action: PayloadAction<{ sourceId: string; targetId: string }>) => {
      const { sourceId, targetId } = action.payload;
      state.connections = state.connections.filter(
        conn => !(conn.sourceId === sourceId && conn.targetId === targetId)
      );
      
      const connectedNodeIds = new Set<string>();
      state.connections.forEach(conn => {
        connectedNodeIds.add(conn.sourceId);
        connectedNodeIds.add(conn.targetId);
      });
      
      state.connectedNodes = {};
      connectedNodeIds.forEach(id => {
        state.connectedNodes[id] = true;
      });
    },
    removeConnectionById: (state, action: PayloadAction<string>) => {
      const connectionId = action.payload;
      state.connections = state.connections.filter(conn => conn.id !== connectionId);
      
      const connectedNodeIds = new Set<string>();
      state.connections.forEach(conn => {
        connectedNodeIds.add(conn.sourceId);
        connectedNodeIds.add(conn.targetId);
      });
      
      state.connectedNodes = {};
      connectedNodeIds.forEach(id => {
        state.connectedNodes[id] = true;
      });
    },
    setConnections: (state, action: PayloadAction<Connection[]>) => {
      state.connections = action.payload;
      state.connectedNodes = {};
      action.payload.forEach(conn => {
        state.connectedNodes[conn.sourceId] = true;
        state.connectedNodes[conn.targetId] = true;
      });
    },
    clearAllConnections: (state) => {
      state.connections = [];
      state.connectedNodes = {};
    },
    removeConnectionsForNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      state.connections = state.connections.filter(
        conn => conn.sourceId !== nodeId && conn.targetId !== nodeId
      );
      
      const connectedNodeIds = new Set<string>();
      state.connections.forEach(conn => {
        connectedNodeIds.add(conn.sourceId);
        connectedNodeIds.add(conn.targetId);
      });
      
      state.connectedNodes = {};
      connectedNodeIds.forEach(id => {
        state.connectedNodes[id] = true;
      });
    },
  },
});

export const { 
  addConnection, 
  removeConnection, 
  removeConnectionById,
  setConnections,
  clearAllConnections,
  removeConnectionsForNode
} = connectionsSlice.actions;

export const selectConnections = (state: any) => state.connections.connections;
export const selectConnectedNodes = (state: any) => state.connections.connectedNodes;
export const selectIsNodeConnected = (nodeId: string) => (state: any) => 
  Boolean(state.connections.connectedNodes[nodeId]);

export const selectConnectionSummary = (state: any) => {
  const connections = state.connections.connections;
  const connectedNodes = state.connections.connectedNodes;
  
  const connectionGraph: Record<string, { outputs: string[]; inputs: string[] }> = {};
  connections.forEach((conn: Connection) => {
    if (!connectionGraph[conn.sourceId]) {
      connectionGraph[conn.sourceId] = { outputs: [], inputs: [] };
    }
    connectionGraph[conn.sourceId].outputs.push(conn.targetId);
    
    if (!connectionGraph[conn.targetId]) {
      connectionGraph[conn.targetId] = { outputs: [], inputs: [] };
    }
    connectionGraph[conn.targetId].inputs.push(conn.sourceId);
  });
  
  return {
    totalConnections: connections.length,
    totalConnectedNodes: Object.keys(connectedNodes).length,
    connections: connections.map((conn: Connection) => ({
      id: conn.id,
      source: conn.sourceId,
      target: conn.targetId,
      sourcePort: conn.sourcePort,
      targetPort: conn.targetPort
    })),
    connectedNodes: Object.keys(connectedNodes),
    connectionGraph,
    summary: connections.map((conn: Connection) => `${conn.sourceId} -> ${conn.targetId}`).join(' | ')
  };
};

export default connectionsSlice.reducer;
