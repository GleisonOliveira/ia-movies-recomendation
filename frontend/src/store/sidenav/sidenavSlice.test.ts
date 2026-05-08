import { configureStore } from '@reduxjs/toolkit';

import { setCollapsed, toggleCollapsed } from '@/store/sidenav/sidenavSlice';
import { sidenavReducer } from '@/store/sidenav/sidenavSlice';

function createRealStore() {
  return configureStore({
    reducer: {
      sidenav: sidenavReducer,
    },
  });
}

describe('sidenavSlice', () => {
  it('initial state', () => {
    const store = createRealStore();
    expect(store.getState().sidenav.collapsed).toBe(true);
  });

  it('toggleCollapsed toggles collapsed', () => {
    const store = createRealStore();
    store.dispatch(toggleCollapsed());
    expect(store.getState().sidenav.collapsed).toBe(false);

    store.dispatch(toggleCollapsed());
    expect(store.getState().sidenav.collapsed).toBe(true);
  });

  it('setCollapsed sets collapsed to the provided value', () => {
    const store = createRealStore();
    store.dispatch(setCollapsed(false));
    expect(store.getState().sidenav.collapsed).toBe(false);

    store.dispatch(setCollapsed(true));
    expect(store.getState().sidenav.collapsed).toBe(true);
  });

  // mobileOpen was removed
});
