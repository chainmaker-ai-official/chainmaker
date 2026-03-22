import { createSlice } from '@reduxjs/toolkit';

// Load initial state from localStorage
const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('quizData');
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error('Failed to load quiz data from localStorage:', error);
    return {};
  }
};

// Save state to localStorage middleware
const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('quizData', serializedState);
  } catch (error) {
    console.error('Failed to save quiz data to localStorage:', error);
  }
};

// Template data from structure.json
const getDefaultQuizData = () => {
  return {
    "quiz-sets": {
      "General Knowledge": [
        {
          question: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          answer: "Paris",
          explanation: "Paris is the capital and most populous city of France."
        }
      ]
    }
  };
};

const initialState = {
  // Key: blockId (e.g., "quiz-16-123456789")
  // Value: { data: { "quiz-sets": { ... } } }
  quizData: loadStateFromLocalStorage(),
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    // Set quiz data for a specific block
    setQuizData: (state, action) => {
      const { blockId, data } = action.payload;
      state.quizData[blockId] = { data };
      saveStateToLocalStorage(state.quizData);
    },
    
    // Update quiz data for a specific block
    updateQuizData: (state, action) => {
      const { blockId, data } = action.payload;
      if (state.quizData[blockId]) {
        state.quizData[blockId].data = data;
      } else {
        state.quizData[blockId] = { data };
      }
      saveStateToLocalStorage(state.quizData);
    },
    
    // Get or initialize quiz data for a block
    initializeQuizData: (state, action) => {
      const { blockId } = action.payload;
      if (!state.quizData[blockId]) {
        state.quizData[blockId] = { data: getDefaultQuizData() };
        saveStateToLocalStorage(state.quizData);
      }
    },
    
    // Remove quiz data for a block
    removeQuizData: (state, action) => {
      const { blockId } = action.payload;
      delete state.quizData[blockId];
      saveStateToLocalStorage(state.quizData);
    },
    
    // Clear all quiz data
    clearAllQuizData: (state) => {
      state.quizData = {};
      saveStateToLocalStorage(state.quizData);
    },
  },
});

export const { 
  setQuizData, 
  updateQuizData, 
  initializeQuizData,
  removeQuizData,
  clearAllQuizData 
} = quizSlice.actions;

// Selectors
export const selectQuizData = (state) => state.quiz.quizData;
export const selectQuizDataByBlockId = (blockId) => (state) => 
  state.quiz.quizData[blockId]?.data || getDefaultQuizData();
export const selectHasQuizData = (blockId) => (state) => 
  !!state.quiz.quizData[blockId];

export default quizSlice.reducer;