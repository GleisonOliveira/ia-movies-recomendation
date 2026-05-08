import { configureStore } from '@reduxjs/toolkit';
import type { Movie } from '@/services/movie/MovieService';
import { createAppContainer } from '@/shared/di/createAppContainer';
import { moviesReducer } from './moviesSlice';
import { loadMovies, initialMoviesLoad } from './moviesThunks';

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

describe('moviesThunks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loadMovies: fulfilled returns movies and updates moviesSlice', async () => {
    const { movieService } = getMockContainer();
    const movies: Movie[] = [{ id: 1, title: 'Matrix', external_id: 1 } as Movie];
    const meta = { last_page: 3 };

    movieService.getAll.mockResolvedValueOnce({
      data: movies,
      meta,
    });

    const store = mkStore();
    await store.dispatch(loadMovies({ page: 2, name: 'matrix' }));

    expect(movieService.getAll).toHaveBeenCalledWith({ page: 2, per_page: 12, name: 'matrix' });
    expect(store.getState().movies.loading).toBe(false);
    expect(store.getState().movies.error).toBeNull();
    expect(store.getState().movies.data).toEqual(movies);
    expect(store.getState().movies.meta).toEqual(meta);
  });

  it('loadMovies: rejected sets error', async () => {
    const { movieService } = getMockContainer();
    movieService.getAll.mockRejectedValueOnce(new Error('boom'));

    const store = mkStore();
    await store.dispatch(loadMovies({ page: 1 }));

    expect(store.getState().movies.loading).toBe(false);
    expect(store.getState().movies.error).toBe('boom');
  });

  it('initialMoviesLoad dispatches loadMovies with current page (and name from state cast)', async () => {
    const { movieService } = getMockContainer();
    movieService.getAll.mockResolvedValueOnce({
      data: [],
      meta: { last_page: 1 },
    });

    const store = mkStore();
    // O thunk usa `state.movies.name` (não existe no slice atual); como ele faz cast no getState,
    // o valor vai sair como `undefined` e ainda assim deve disparar `loadMovies`.
    await store.dispatch(initialMoviesLoad());

    expect(movieService.getAll).toHaveBeenCalledWith({ page: 1, per_page: 12, name: undefined });
  });
});

