import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('tableData');
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error('Failed to load table data from localStorage:', error);
    return {};
  }
};

// Save state to localStorage middleware
const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('tableData', serializedState);
  } catch (error) {
    console.error('Failed to save table data to localStorage:', error);
  }
};

// Default table data for general-purpose table
const getDefaultTableData = () => {
  return {
    title: "General Table",
    mode: "edit", // "edit" or "reveal"
    textSize: 16, // Default text size in pixels
    columns: [
      { id: "col1", label: "Column A" },
      { id: "col2", label: "Column B" },
      { id: "col3", label: "Column C" }
    ],
    rows: [
      { id: "row1", col1: "Row 1, Col A", col2: "Row 1, Col B", col3: "Row 1, Col C" },
      { id: "row2", col1: "Row 2, Col A", col2: "Row 2, Col B", col3: "Row 2, Col C" },
      { id: "row3", col1: "Row 3, Col A", col2: "Row 3, Col B", col3: "Row 3, Col C" }
    ]
  };
};

// Convert old vocabulary format to new format
const convertOldFormatToNew = (oldData) => {
  if (!oldData || !oldData.list || !Array.isArray(oldData.list)) {
    return getDefaultTableData();
  }
  
  // Check if this looks like vocabulary data
  const firstItem = oldData.list[0];
  const isVocabularyFormat = firstItem && 
    (firstItem.word !== undefined || firstItem.phonetic !== undefined || firstItem.chinese !== undefined);
  
  if (isVocabularyFormat) {
    // Convert vocabulary format to new format
    return {
      title: oldData.title || "Vocabulary Table",
      mode: "reveal", // Vocabulary tables default to reveal mode
      columns: [
        { id: "order", label: "Order" },
        { id: "word", label: "Word" },
        { id: "phonetic", label: "Phonetic" },
        { id: "translation", label: "Translation" }
      ],
      rows: oldData.list.map((item, index) => ({
        id: `row${index + 1}`,
        order: item.order || index + 1,
        word: item.word || "",
        phonetic: item.phonetic || "",
        translation: item.chinese || ""
      }))
    };
  }
  
  // If not vocabulary format, return default
  return getDefaultTableData();
};

const initialState = {
  // Key: blockId (e.g., "table-1-123456789")
  // Value: { data: { title: "...", list: [...] } }
  tableData: loadStateFromLocalStorage(),
};

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    // Set table data for a specific block
    setTableData: (state, action) => {
      const { blockId, data } = action.payload;
      state.tableData[blockId] = { data };
      saveStateToLocalStorage(state.tableData);
    },
    
    // Update table data for a specific block
    updateTableData: (state, action) => {
      const { blockId, data } = action.payload;
      if (state.tableData[blockId]) {
        state.tableData[blockId].data = data;
      } else {
        state.tableData[blockId] = { data };
      }
      saveStateToLocalStorage(state.tableData);
    },
    
    // Get or initialize table data for a block
    initializeTableData: (state, action) => {
      const { blockId } = action.payload;
      if (!state.tableData[blockId]) {
        state.tableData[blockId] = { data: getDefaultTableData() };
        saveStateToLocalStorage(state.tableData);
      }
    },
    
    // Remove table data for a block
    removeTableData: (state, action) => {
      const { blockId } = action.payload;
      delete state.tableData[blockId];
      saveStateToLocalStorage(state.tableData);
    },
    
    // Clear all table data
    clearAllTableData: (state) => {
      state.tableData = {};
      saveStateToLocalStorage(state.tableData);
    },
  },
});

export const { 
  setTableData, 
  updateTableData, 
  initializeTableData,
  removeTableData,
  clearAllTableData 
} = tableSlice.actions;

// Selectors
export const selectTableData = (state) => state.table?.tableData || {};
export const selectTableDataByBlockId = (blockId) => (state) => {
  const rawData = state.table?.tableData?.[blockId]?.data;
  
  if (!rawData) {
    return getDefaultTableData();
  }
  
  // Check if data is in old format and convert if needed
  if (rawData.list && Array.isArray(rawData.list)) {
    return convertOldFormatToNew(rawData);
  }
  
  return rawData;
};
export const selectHasTableData = (blockId) => (state) => 
  !!(state.table?.tableData?.[blockId]);
export default tableSlice.reducer;