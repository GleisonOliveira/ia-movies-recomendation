import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from '@/store/users/usersSlice';
import { moviesReducer } from '@/store/movies/moviesSlice';
import { sidenavReducer } from '@/store/sidenav/sidenavSlice';

export const store = configureStore({
reducer: {
  home: userReducer,
  movies: moviesReducer,
  sidenav: sidenavReducer,
},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
