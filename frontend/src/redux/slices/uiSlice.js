import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeMenu: 'classes', // 'classes' for Dashboard, 'designer' for Designer, 'home' for home
  activePanel: null, // null, 'panel-1', 'panel-2', 'panel-3'
  panelOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveMenu: (state, action) => {
      state.activeMenu = action.payload;
    },
    setActivePanel: (state, action) => {
      state.activePanel = action.payload;
      state.panelOpen = action.payload !== null;
    },
    setPanelOpen: (state, action) => {
      state.panelOpen = action.payload;
      if (!action.payload) {
        state.activePanel = null;
      }
    },
    togglePanel: (state, action) => {
      const panelId = action.payload;
      if (state.activePanel === panelId) {
        state.activePanel = null;
        state.panelOpen = false;
      } else {
        state.activePanel = panelId;
        state.panelOpen = true;
      }
    },
  },
});

export const { setActiveMenu, setActivePanel, setPanelOpen, togglePanel } = uiSlice.actions;

export const selectActiveMenu = (state) => state.ui.activeMenu;
export const selectActivePanel = (state) => state.ui.activePanel;
export const selectPanelOpen = (state) => state.ui.panelOpen;

export default uiSlice.reducer;