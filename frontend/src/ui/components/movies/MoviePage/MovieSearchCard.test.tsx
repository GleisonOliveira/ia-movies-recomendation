import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MovieSearchCard } from './MovieSearchCard';
import { moviesReducer, createInitialMoviesState } from '@/store/movies/moviesSlice';
import { loadMovies } from '@/store/movies/moviesThunks';
import { renderWithStore } from '@/test/testUtils';
import type { RootState } from '@/store/store';

jest.mock('@/store/movies/moviesThunks', () => {
  const actual = jest.requireActual('@/store/movies/moviesThunks');
  // Preserva os campos pending/fulfilled/rejected usados pelo slice,
  // mas intercepta a execução do thunk para não depender de chamadas externas.
  return {
    ...actual,
    loadMovies: Object.assign(jest.fn(() => ({ type: actual.loadMovies.pending.type })), {
      pending: actual.loadMovies.pending,
      fulfilled: actual.loadMovies.fulfilled,
      rejected: actual.loadMovies.rejected,
    }),
  };
});

describe('MovieSearchCard', () => {
  it('renders title and search controls', () => {
    renderWithStore(<MovieSearchCard />, {
      reducer: { movies: moviesReducer },
      preloadedState: { movies: { ...createInitialMoviesState(), loading: true, query: '' } },
    });

    expect(screen.getByText('Filmes')).toBeInTheDocument();
    expect(screen.getByText('Busque e navegue')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite o nome do filme')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
  });

  it('updates input and dispatches setMovieQuery on click', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<MovieSearchCard />, {
      reducer: { movies: moviesReducer },
      preloadedState: { movies: { ...createInitialMoviesState(), loading: false, query: '' } },
    });

    const input = screen.getByPlaceholderText('Digite o nome do filme');
    await user.type(input, 'Matrix');

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect((store.getState() as RootState).movies.query).toBe('Matrix');
  });

  it('disables button when canSubmit is false or loading is true', () => {
    const { unmount } = renderWithStore(<MovieSearchCard />, {
      reducer: { movies: moviesReducer },
      preloadedState: { movies: { ...createInitialMoviesState(), loading: false, query: '' } },
    });
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    unmount();

    renderWithStore(<MovieSearchCard />, {
      reducer: { movies: moviesReducer },
      preloadedState: { movies: { ...createInitialMoviesState(), loading: true, query: 'Matrix' } },
    });
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  });

  it('keeps query unchanged when clicking while disabled (empty)', async () => {
    const { store } = renderWithStore(<MovieSearchCard />, {
      reducer: { movies: moviesReducer },
      preloadedState: { movies: { ...createInitialMoviesState(), loading: false, query: '' } },
    });
    const button = screen.getByRole('button', { name: 'Buscar' });
    expect(button).toBeDisabled();
    expect((store.getState() as RootState).movies.query).toBe('');
  });

  it('resets the filter when clearing the input', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<MovieSearchCard />, {
      reducer: { movies: moviesReducer },
      preloadedState: { movies: { ...createInitialMoviesState(), loading: false, query: 'Matrix' } },
    });

    const input = screen.getByPlaceholderText('Digite o nome do filme');
    expect(input).toHaveValue('Matrix');

    await user.clear(input);
    expect((store.getState() as RootState).movies.query).toBe('');
    expect(loadMovies).toHaveBeenCalledWith({ page: 1, name: undefined });
  });

  it('clears search and reloads endpoint without name when clicking Limpar', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<MovieSearchCard />, {
      reducer: { movies: moviesReducer },
      preloadedState: { movies: { ...createInitialMoviesState(), loading: false, query: 'Matrix' } },
    });

    const clearBtn = screen.getByRole('button', { name: 'Limpar' });
    expect(clearBtn).toBeEnabled();

    await user.click(clearBtn);
    expect((store.getState() as RootState).movies.query).toBe('');
    expect(loadMovies).toHaveBeenCalledWith({ page: 1, name: undefined });
  });
});
