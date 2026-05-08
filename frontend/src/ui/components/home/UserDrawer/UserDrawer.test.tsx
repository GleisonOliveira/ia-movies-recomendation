import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithStore } from '@/test/testUtils';
import type { Movie } from '@/services/movie/MovieService';
import type { User } from '@/services/user/user-service';
import { userReducer } from '@/store/users/usersSlice';
import { UserDrawer } from './UserDrawer';
import { buildMovie, buildUser } from '@/test/store/home/__fixtures__/homeThunksFixtures';
import { buildHomePreloadedState } from '@/test/store/home/__fixtures__/homeComponentState';
import { getAxiosMocks } from '@/test/utils/axiosMock';

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    Autocomplete: (props: unknown) => {
      const { inputValue, onInputChange, renderInput } = props as {
        inputValue?: string;
        onInputChange?: (event: unknown, value: string) => void;
        renderInput?: (params: unknown) => React.ReactNode;
      };
      return (
        <div>
          {renderInput?.({ label: 'Adicionar filme' })}
          <input
            aria-label="movie-search-input"
            value={inputValue ?? ''}
            onChange={(e) => onInputChange?.(e, e.currentTarget.value)}
          />
        </div>
      );
    },
  };
});

jest.mock('axios');

describe('UserDrawer', () => {
  beforeEach(() => {
    jest.useRealTimers();
    const { get, post, delete: del } = getAxiosMocks();
    get.mockReset();
    post.mockReset();
    del.mockReset();
  });

  it('renders loading while movies are loading', () => {
    const user: User = buildUser({ id: 1, name: 'Ana', age: 28, latest_movies: [] });

    const { get } = getAxiosMocks();
    let resolveRequest!: (value: unknown) => void;

    const pendingPromise = new Promise((resolve) => {
      resolveRequest = resolve;
    });

    // GET /user/movie (disparado pelo useMovieHome ao abrir o drawer)
    get.mockReturnValueOnce(pendingPromise);

    renderWithStore(<UserDrawer />, {
      reducer: { home: userReducer },
      preloadedState: buildHomePreloadedState({
        selectedUser: user,
        userState: { data: [user] },
        movieState: { userMovies: { loading: true, data: [], meta: null }, loading: false, selected: null },
      }),
    });

    expect(screen.getByTestId('user-movies-loading')).toBeInTheDocument();

    resolveRequest({
      data: { data: [], meta: { total: 0, last_page: 1, current_page: 1, per_page: 6, prev: null, next: null } },
    });
  });

  // it('loads movies when drawer opens and closes on "Fechar"', async () => {
  //   const user: User = buildUser({ id: 1, name: 'Ana', age: 28, latest_movies: [] });
  //   const movie: Movie = buildMovie({ id: 10, title: 'Matrix', external_id: 10 });

  //   const { get } = getAxiosMocks();

  //   // GET /user/movie (disparado por useMovieHome quando o drawer abre)
  //   get.mockResolvedValueOnce({
  //     data: {
  //       data: [movie],
  //       meta: { total: 1, last_page: 1, current_page: 1, per_page: 6, prev: null, next: null },
  //     },
  //   });

  //   renderWithStore(<UserDrawer />, {
  //     reducer: { home: userReducer },
  //     preloadedState: buildHomePreloadedState({
  //       selectedUser: user,
  //       userState: { data: [user] },
  //       movieState: { userMovies: { loading: true, data: [] } },
  //     }),
  //   });

  //   expect(await screen.findByText('Matrix')).toBeInTheDocument();
  //   const closeBtn = screen.getByRole('button', { name: 'Fechar' });
  //   act(() => {
  //     fireEvent.click(closeBtn);
  //   });

  //   await waitFor(() => {
  //     expect(screen.queryByText('Selecione um usuário')).not.toBeInTheDocument();
  //   });

  //   expect(get).toHaveBeenCalled();
  // });

  // it('removes movie associated when clicking "Remover"', async () => {
  //   const user: User = buildUser({ id: 1, name: 'Ana', age: 28, latest_movies: [] });
  //   const movie: Movie = buildMovie({ id: 10, title: 'Matrix', external_id: 10 });

  //   const { get, delete: del } = getAxiosMocks();

  //   // GET /user/movie on mount
  //   get.mockResolvedValueOnce({
  //     data: {
  //       data: [movie],
  //       meta: { total: 1, last_page: 1, current_page: 1, per_page: 6, prev: null, next: null },
  //     },
  //   });

  //   // GET /user/movie after DELETE
  //   get.mockResolvedValueOnce({
  //     data: {
  //       data: [],
  //       meta: { total: 0, last_page: 1, current_page: 1, per_page: 6, prev: null, next: null },
  //     },
  //   });

  //   del.mockResolvedValueOnce({ status: 204 });

  //   renderWithStore(<UserDrawer />, {
  //     reducer: { home: userReducer },
  //     preloadedState: buildHomePreloadedState({
  //       selectedUser: user,
  //       userState: { data: [user] },
  //       movieState: { userMovies: { loading: true, data: [] } },
  //     }),
  //   });

  //   expect(await screen.findByText('Matrix')).toBeInTheDocument();
  //   act(() => {
  //     fireEvent.click(screen.getByRole('button', { name: 'Remover' }));
  //   });

  //   await waitFor(() => expect(del).toHaveBeenCalled());
  //   await waitFor(() => expect(screen.queryByText('Matrix')).not.toBeInTheDocument());
  // });

  // it('searches movies when typing in the search input (debounced)', async () => {
  //   jest.useFakeTimers();

  //   const user: User = buildUser({ id: 1, name: 'Ana', age: 28, latest_movies: [] });
  //   const { get } = getAxiosMocks();

  //   const initialMovies: Movie[] = [];

  //   // GET /user/movie on mount
  //   get.mockResolvedValueOnce({
  //     data: {
  //       data: initialMovies,
  //       meta: { total: 0, last_page: 1, current_page: 1, per_page: 6, prev: null, next: null },
  //     },
  //   });

  //   // GET /movie after debounce
  //   const optionMovie: Movie = buildMovie({ id: 99, title: 'Filme 99', external_id: 99 });

  //   get.mockResolvedValueOnce({
  //     data: {
  //       data: [optionMovie],
  //       meta: { total: 1, last_page: 1, current_page: 1, per_page: 10, prev: null, next: null },
  //     },
  //   });

  //   renderWithStore(<UserDrawer />, {
  //     reducer: { home: userReducer },
  //     preloadedState: buildHomePreloadedState({
  //       selectedUser: user,
  //       userState: { data: [user] },
  //       movieState: { userMovies: { loading: true, data: [] } },
  //     }),
  //   });

  //   // Debounce: 300ms
  //   await act(async () => {
  //     fireEvent.change(screen.getByLabelText('movie-search-input'), {
  //       target: { value: 'Filme' },
  //     });
  //     jest.advanceTimersByTime(300);

  //     // garante que atualizações agendadas por Promises/microtasks sejam aplicadas
  //     await Promise.resolve();
  //   });

  //   await waitFor(() => {
  //     const calledMovieEndpoint = get.mock.calls.some((c) => c[0] === '/movie');
  //     expect(calledMovieEndpoint).toBe(true);
  //   });
  // });

  // it('adds movie associated when clicking "Adicionar" with a selected movie', async () => {
  //   const user: User = buildUser({ id: 1, name: 'Ana', age: 28, latest_movies: [] });
  //   const movieToAdd: Movie = buildMovie({ id: 10, title: 'Matrix', external_id: 10 });

  //   const { get, post } = getAxiosMocks();

  //   // GET /user/movie on mount
  //   get.mockResolvedValueOnce({
  //     data: {
  //       data: [],
  //       meta: { total: 0, last_page: 1, current_page: 1, per_page: 6, prev: null, next: null },
  //     },
  //   });

  //   // POST /user/movie
  //   post.mockResolvedValueOnce({
  //     status: 204,
  //     data: null,
  //   });

  //   // GET /user/movie after addMovieToUser
  //   get.mockResolvedValueOnce({
  //     data: {
  //       data: [movieToAdd],
  //       meta: { total: 1, last_page: 1, current_page: 1, per_page: 6, prev: null, next: null },
  //     },
  //   });

  //   renderWithStore(<UserDrawer />, {
  //     reducer: { home: userReducer },
  //     preloadedState: buildHomePreloadedState({
  //       selectedUser: user,
  //       userState: { data: [user] },
  //       movieState: { selected: movieToAdd, userMovies: { loading: false, data: [] } },
  //     }),
  //   });

  //   const addButton = screen.getByRole('button', { name: 'Adicionar' });
  //   expect(addButton).toBeEnabled();

  //   act(() => {
  //     fireEvent.click(addButton);
  //   });
  //   await waitFor(() => expect(post).toHaveBeenCalled());

  //   await waitFor(() => expect(addButton).toBeDisabled());
  // });
});
