import { createContext, useContext, useState, useCallback } from 'react';
import { getActivities } from '../services/activityDataService';

// Create context
const ActivityContext = createContext();

// Initial state structure for each activity
const initialActivityStates = {
  'quiz-001': {
    currentQuestionIndex: 0,
    score: 0,
    answered: false,
    quizCompleted: false,
    userAnswers: []
  },
  'memory-game-001': {
    cards: [],
    flipped: [],
    matched: [],
    moves: 0,
    gameComplete: false
  },
  'flashcards-001': {
    currentCardIndex: 0,
    flipped: false,
    completedCards: []
  },
  'fill-in-blanks-001': {
    currentQuestionIndex: 0,
    completedPrompts: 0,
    currentStreak: 0,
    correctWords: 0,
    totalWords: 0,
    filledStates: {},
    shuffledTiles: {},
    hiddenTiles: [],
    currentPromptComplete: false,
    userAnswers: {},
    completed: false
  },
  'matching-game': {
    cards: [],
    matchedCards: [],
    showAllCount: 0,
    cheatMode: false,
    wrongAttemptCount: 0,
    isHintActive: false,
    hintStrengthToggle: false
  },
  'generic-001': {
    score: 0,
    lastAccessed: null,
    lastScoreUpdate: null
  }
};

// Helper function to get the first activity ID from the ordered activities
const getFirstActivityId = () => {
  const activities = getActivities();
  if (activities.length > 0) {
    return activities[0].id;
  }
  // Fallback to 'quiz-001' if no activities are available
  return 'quiz-001';
};

// Provider component
export function ActivityProvider({ children }) {
  const [activityStates, setActivityStates] = useState(initialActivityStates);
  const [currentActivity, setCurrentActivity] = useState(getFirstActivityId());

  // Update state for a specific activity
  const updateActivityState = useCallback((activityId, newState) => {
    setActivityStates(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        ...newState
      }
    }));
  }, []);

  // Reset state for a specific activity
  const resetActivityState = useCallback((activityId) => {
    setActivityStates(prev => ({
      ...prev,
      [activityId]: initialActivityStates[activityId]
    }));
  }, []);

  // Get state for a specific activity
  const getActivityState = useCallback((activityId) => {
    return activityStates[activityId] || initialActivityStates[activityId];
  }, [activityStates]);

  const value = {
    currentActivity,
    setCurrentActivity,
    activityStates,
    updateActivityState,
    resetActivityState,
    getActivityState
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

// Custom hook to use the activity context
export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}