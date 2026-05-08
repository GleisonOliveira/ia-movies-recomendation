import { configureStore } from '@reduxjs/toolkit';
import { createAppContainer } from '@/shared/di/createAppContainer';
import { moviesReducer, clearMoviesError, resetMoviesState, setMovieQuery, setMoviesPage } from './moviesSlice';
import { loadMovies } from './moviesThunks';
import type { Movie } from '@/services/movie/MovieService';

type MockAppContainer = {
  movieService: ReturnType<typeof createMockMovieService>;
};

function createMockMovieService() {
  return {
    getAll: jest.fn<Promise<{ data: Movie[]; meta: { last_page: number } }>, [{ page?: number; per_page?: number; name?: string }?]>(),
  };
}

jest.mock('@/shared/di/createAppContainer', () => {
  const movieService = createMockMovieService();
  return {
    createAppContainer: () => ({
      movieService,
    }),
  };
});

const getMockContainer = (): MockAppContainer =>
  createAppContainer() as unknown as MockAppContainer;

const mkStore = () =>
  configureStore({
    reducer: {
      movies: moviesReducer,
    },
  });

describe('moviesSlice', () => {
  it('initialState matches expected defaults', () => {
    const store = mkStore();
    const state = store.getState().movies;

    expect(state).toEqual({
      loading: false,
      error: null,
      data: [],
      meta: null,
      page: 1,
      query: '',
    });
  });

  describe('sync reducers', () => {
    it('resetMoviesState returns to initial defaults', () => {
      const store = mkStore();
      store.dispatch(setMoviesPage(3));
      store.dispatch(setMovieQuery('matrix'));
      store.dispatch({ type: 'movies/loadMovies/rejected', error: { message: 'boom' } });

      store.dispatch(resetMoviesState());

      expect(store.getState().movies).toEqual({
        loading: false,
        error: null,
        data: [],
        meta: null,
        page: 1,
        query: '',
      });
    });

    it('setMoviesPage updates only page', () => {
      const store = mkStore();
      store.dispatch(setMoviesPage(3));
      store.dispatch({ type: 'movies/loadMovies/fulfilled', payload: { data: [], meta: { last_page: 9 } } });

      const state = store.getState().movies;
      expect(state.page).toBe(3);
      expect(state.meta).toEqual({ last_page: 9 });
    });

    it('setMovieQuery updates query and resets page to 1', () => {
      const store = mkStore();
      store.dispatch(setMoviesPage(2));
      store.dispatch(setMovieQuery('matrix'));

      const state = store.getState().movies;
      expect(state.query).toBe('matrix');
      expect(state.page).toBe(1);
    });

    it('clearMoviesError sets error to null', () => {
      const store = mkStore();
      store.dispatch({ type: 'movies/loadMovies/rejected', error: { message: 'boom' } });
      expect(store.getState().movies.error).toBe('boom');

      store.dispatch(clearMoviesError());
      expect(store.getState().movies.error).toBeNull();
    });
  });

  describe('extraReducers via real thunks', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('loadMovies.pending/fulfilled updates movies', async () => {
      const store = mkStore();
      const { movieService } = getMockContainer();
      const movies: Movie[] = [{ id: 1, title: 'Matrix', external_id: 1 } as Movie];
      const meta = { last_page: 3 };

      movieService.getAll.mockResolvedValueOnce({
        data: movies,
        meta,
      });

      await store.dispatch(loadMovies({ page: 2, name: 'matrix' }));

      const state = store.getState().movies;
      expect(movieService.getAll).toHaveBeenCalledWith({ page: 2, per_page: 12, name: 'matrix' });
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.data).toHaveLength(1);
      expect(state.data[0]?.title).toBe('Matrix');
      expect(state.meta).toEqual(meta);
    });

    it('loadMovies.rejected sets error', async () => {
      const store = mkStore();
      const { movieService } = getMockContainer();

      movieService.getAll.mockRejectedValueOnce(new Error('boom'));

      await store.dispatch(loadMovies({ page: 1 }));

      const state = store.getState().movies;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('boom');
    });
  });
});

