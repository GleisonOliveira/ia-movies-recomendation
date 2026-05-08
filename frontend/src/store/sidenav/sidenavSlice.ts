import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type SidenavState = {
  collapsed: boolean;
};

const initialState: SidenavState = {
  collapsed: true,
};

const sidenavSlice = createSlice({
  name: 'sidenav',
  initialState,
  reducers: {
    toggleCollapsed(state) {
      state.collapsed = !state.collapsed;
    },
    setCollapsed(state, action: PayloadAction<boolean>) {
      state.collapsed = action.payload;
    },
  },
});

export const { toggleCollapsed, setCollapsed } = sidenavSlice.actions;
export const sidenavReducer = sidenavSlice.reducer;
