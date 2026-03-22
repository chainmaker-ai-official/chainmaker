import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Array of connection objects: { id, sourceId, targetId, sourcePort, targetPort }
  connections: [],
  // Set-like object tracking which block IDs are connected: { blockId: true }
  connectedBlocks: {},
};

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    addConnection: (state, action) => {
      const { id, sourceId, targetId, sourcePort = 'output', targetPort = 'input' } = action.payload;
      
      // Check if connection already exists
      const exists = state.connections.some(
        conn => conn.sourceId === sourceId && conn.targetId === targetId
      );
      
      if (!exists) {
        const connectionId = id || `conn-${Date.now()}`;
        state.connections.push({
          id: connectionId,
          sourceId,
          targetId,
          sourcePort,
          targetPort,
        });
        
        // Mark both blocks as connected
        state.connectedBlocks[sourceId] = true;
        state.connectedBlocks[targetId] = true;
      }
    },
    
    removeConnection: (state, action) => {
      const { sourceId, targetId } = action.payload;
      const connectionIndex = state.connections.findIndex(
        conn => conn.sourceId === sourceId && conn.targetId === targetId
      );
      
      if (connectionIndex !== -1) {
        state.connections.splice(connectionIndex, 1);
        
        // Recalculate connected blocks
        const connectedBlockIds = new Set();
        state.connections.forEach(conn => {
          connectedBlockIds.add(conn.sourceId);
          connectedBlockIds.add(conn.targetId);
        });
        
        // Update connectedBlocks - remove blocks that no longer have connections
        if (!connectedBlockIds.has(sourceId)) {
          delete state.connectedBlocks[sourceId];
        }
        if (!connectedBlockIds.has(targetId)) {
          delete state.connectedBlocks[targetId];
        }
      }
    },
    
    removeConnectionById: (state, action) => {
      const connectionId = action.payload;
      const connection = state.connections.find(conn => conn.id === connectionId);
      
      if (connection) {
        state.connections = state.connections.filter(conn => conn.id !== connectionId);
        
        // Recalculate connected blocks
        const connectedBlockIds = new Set();
        state.connections.forEach(conn => {
          connectedBlockIds.add(conn.sourceId);
          connectedBlockIds.add(conn.targetId);
        });
        
        // Update connectedBlocks
        if (!connectedBlockIds.has(connection.sourceId)) {
          delete state.connectedBlocks[connection.sourceId];
        }
        if (!connectedBlockIds.has(connection.targetId)) {
          delete state.connectedBlocks[connection.targetId];
        }
      }
    },
    
    setConnections: (state, action) => {
      state.connections = action.payload;
      
      // Recalculate connected blocks
      const connectedBlockIds = new Set();
      action.payload.forEach(conn => {
        connectedBlockIds.add(conn.sourceId);
        connectedBlockIds.add(conn.targetId);
      });
      
      // Reset connectedBlocks
      state.connectedBlocks = {};
      connectedBlockIds.forEach(id => {
        state.connectedBlocks[id] = true;
      });
    },
    
    clearAllConnections: (state) => {
      state.connections = [];
      state.connectedBlocks = {};
    },
    
    // Remove all connections for a specific block (when block is deleted)
    removeConnectionsForBlock: (state, action) => {
      const blockId = action.payload;
      
      // Filter out all connections involving this block
      state.connections = state.connections.filter(
        conn => conn.sourceId !== blockId && conn.targetId !== blockId
      );
      
      // Recalculate connected blocks
      const connectedBlockIds = new Set();
      state.connections.forEach(conn => {
        connectedBlockIds.add(conn.sourceId);
        connectedBlockIds.add(conn.targetId);
      });
      
      // Reset connectedBlocks
      state.connectedBlocks = {};
      connectedBlockIds.forEach(id => {
        state.connectedBlocks[id] = true;
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
  removeConnectionsForBlock
} = connectionsSlice.actions;

// Selectors
export const selectConnections = (state) => state.connections.connections;
export const selectConnectedBlocks = (state) => state.connections.connectedBlocks;
export const selectIsBlockConnected = (blockId) => (state) => 
  Boolean(state.connections.connectedBlocks[blockId]);
export const selectBlockConnections = (blockId) => (state) => 
  state.connections.connections.filter(
    conn => conn.sourceId === blockId || conn.targetId === blockId
  );

// Comprehensive connection summary selector
export const selectConnectionSummary = (state) => {
  const connections = state.connections.connections;
  const connectedBlocks = state.connections.connectedBlocks;
  
  // Build a connection graph
  const connectionGraph = {};
  connections.forEach(conn => {
    // Add source -> target relationship
    if (!connectionGraph[conn.sourceId]) {
      connectionGraph[conn.sourceId] = { outputs: [], inputs: [] };
    }
    connectionGraph[conn.sourceId].outputs.push(conn.targetId);
    
    // Add target <- source relationship
    if (!connectionGraph[conn.targetId]) {
      connectionGraph[conn.targetId] = { outputs: [], inputs: [] };
    }
    connectionGraph[conn.targetId].inputs.push(conn.sourceId);
  });
  
  return {
    totalConnections: connections.length,
    totalConnectedBlocks: Object.keys(connectedBlocks).length,
    connections: connections.map(conn => ({
      id: conn.id,
      source: conn.sourceId,
      target: conn.targetId,
      sourcePort: conn.sourcePort,
      targetPort: conn.targetPort
    })),
    connectedBlocks: Object.keys(connectedBlocks),
    connectionGraph,
    // Human-readable summary
    summary: connections.map(conn => `${conn.sourceId} → ${conn.targetId}`).join(' | ')
  };
};

export default connectionsSlice.reducer;
