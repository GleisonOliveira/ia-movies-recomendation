import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Movie } from '@/services/movie/MovieService';
import { loadMovies } from '@/store/movies/moviesThunks';

export type MoviesState = {
  loading: boolean;
  error: string | null;
  data: Movie[];
  meta: { last_page: number } | null;
  page: number;
  query: string;
};

export function createInitialMoviesState(): MoviesState {
  return {
    loading: false,
    error: null,
    data: [],
    meta: null,
    page: 1,
    query: '',
  };
}

const moviesSlice = createSlice({
  name: 'movies',
  initialState: createInitialMoviesState(),
  reducers: {
    resetMoviesState(state) {
      return createInitialMoviesState();
    },
    setMoviesPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setMovieQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
      state.page = 1;
    },
    clearMoviesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(loadMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? String(action.payload) : action.error.message ?? 'Erro ao carregar filmes';
      });
  },
});

export const { resetMoviesState, setMoviesPage, setMovieQuery, clearMoviesError } = moviesSlice.actions;
export const moviesReducer = moviesSlice.reducer;
