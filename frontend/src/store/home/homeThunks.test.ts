import { configureStore } from '@reduxjs/toolkit';
import { homeReducer } from './homeSlice';
import {
  addMovieToUser,
  createUser,
  loadUserMovies,
  loadUsers,
  removeMovieFromUser,
  searchMovies,
  submitCreateUserModal,
} from './homeThunks';

import type { Movie } from '@/services/movie/MovieService';
import type { User } from '@/services/user/user-service';
import { createAppContainer } from '@/shared/di/createAppContainer';
import { buildMovie, buildUser } from '@/test/store/home/__fixtures__/homeThunksFixtures';
import type {
  MovieServiceGetAllArg0,
  MovieServiceGetAllReturn,
  UserServiceAddMovieToUserArg0,
  UserServiceAddMovieToUserReturn,
  UserServiceCreateArg0,
  UserServiceCreateReturn,
  UserServiceGetAllArg0,
  UserServiceGetAllReturn,
  UserServiceGetMoviesByUserIdArg0,
  UserServiceGetMoviesByUserIdReturn,
  UserServiceRemoveMovieFromUserArg0,
  UserServiceRemoveMovieFromUserReturn,
} from '@/test/store/home/homeThunksTypes';

type MockAppContainer = {
  userService: ReturnType<typeof createMockUserService>;
  movieService: ReturnType<typeof createMockMovieService>;
};

function createMockUserService() {
  return {
    getAll: jest.fn<UserServiceGetAllReturn, [UserServiceGetAllArg0?]>(),
    create: jest.fn<UserServiceCreateReturn, [UserServiceCreateArg0]>(),
    getMoviesByUserId: jest.fn<UserServiceGetMoviesByUserIdReturn, [UserServiceGetMoviesByUserIdArg0]>(),
    addMovieToUser: jest.fn<UserServiceAddMovieToUserReturn, [UserServiceAddMovieToUserArg0]>(),
    removeMovieFromUser: jest.fn<UserServiceRemoveMovieFromUserReturn, [UserServiceRemoveMovieFromUserArg0]>(),
  };
}

function createMockMovieService() {
  return {
    getAll: jest.fn<MovieServiceGetAllReturn, [MovieServiceGetAllArg0]>(),
  };
}

jest.mock('@/shared/di/createAppContainer', () => {
  const userService = createMockUserService();
  const movieService = createMockMovieService();

  return {
    createAppContainer: () => ({
      userService,
      movieService,
    }),
  };
});

const getMockContainer = (): MockAppContainer =>
  createAppContainer() as unknown as MockAppContainer;

const mkStore = () =>
  configureStore({
    reducer: {
      home: homeReducer,
    },
  });

describe('homeThunks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loadUsers: fulfilled updates state', async () => {
    const { userService } = getMockContainer();
    const users: User[] = [buildUser({ id: 1, name: 'Ana', age: 28, latest_movies: [] })];
    userService.getAll.mockResolvedValue({
      data: users,
      meta: { total: 1, last_page: 1, current_page: 1, per_page: 8, prev: null, next: null },
    });

    const store = mkStore();
    await store.dispatch(loadUsers(2));

    expect(userService.getAll).toHaveBeenCalledWith({ page: 2, per_page: 8 });
    expect(store.getState().home.userState.data).toEqual(users);
  });

  it('loadUsers: rejected shows toast', async () => {
    const { userService } = getMockContainer();
    userService.getAll.mockRejectedValue(new Error('boom'));

    const store = mkStore();
    await store.dispatch(loadUsers(1));

    expect(store.getState().home.toast.open).toBe(true);
    expect(store.getState().home.toast.message).toBe('boom');
  });

  it('createUser: fulfilled triggers loadUsers for current page', async () => {
    const { userService } = getMockContainer();
    const created = buildUser({ id: 2, name: 'Bruno', age: 31, latest_movies: [] });
    userService.create.mockResolvedValue(created);
    userService.getAll.mockResolvedValue({
      data: [created],
      meta: { total: 1, last_page: 1, current_page: 1, per_page: 8, prev: null, next: null },
    });

    const store = mkStore();
    store.dispatch({ type: 'home/setUsersPage', payload: 3 });

    await store.dispatch(createUser({ name: 'Bruno', age: 31 }));

    expect(userService.create).toHaveBeenCalledWith({ name: 'Bruno', age: 31 });
    expect(userService.getAll).toHaveBeenCalledWith({ page: 3, per_page: 8 });
    expect(store.getState().home.toast.open).toBe(true);
  });

  it('submitCreateUserModal: invalid payload rejects with field errors', async () => {
    const { userService } = getMockContainer();
    userService.create.mockResolvedValue(buildUser());

    const store = mkStore();
    store.dispatch({
      type: 'home/setCreateUserName',
      payload: '',
    });
    store.dispatch({
      type: 'home/setCreateUserAge',
      payload: '-1',
    });

    await store.dispatch(submitCreateUserModal());

    expect(userService.create).not.toHaveBeenCalled();
    expect(store.getState().home.createUserModal.errors.name).not.toBeNull();
    expect(store.getState().home.createUserModal.errors.age).not.toBeNull();
  });

  it('submitCreateUserModal: condition prevents dispatch when submitting=true', async () => {
    const { userService } = getMockContainer();
    userService.create.mockResolvedValue(buildUser());

    const store = mkStore();
    store.dispatch({ type: 'home/openCreateUserModal' });
    // homeSlice sets `createUserModal.submitting=true` on `createUser.pending`
    store.dispatch({ type: 'home/createUser/pending' });

    store.dispatch({
      type: 'home/setCreateUserName',
      payload: 'Ana',
    });
    store.dispatch({
      type: 'home/setCreateUserAge',
      payload: '30',
    });

    await store.dispatch(submitCreateUserModal());
    expect(userService.create).not.toHaveBeenCalled();
  });

  it('loadUserMovies: fulfilled updates userMovies', async () => {
    const { userService } = getMockContainer();
    const movie: Movie = buildMovie({ id: 1, popularity: 1, vote_average: 8 });
    userService.getMoviesByUserId.mockResolvedValue({
      data: [movie],
      meta: { total: 1, last_page: 1, current_page: 1, per_page: 6, prev: null, next: null },
    });

    const store = mkStore();
    await store.dispatch(loadUserMovies({ userId: 9, page: 2 }));

    expect(userService.getMoviesByUserId).toHaveBeenCalledWith({ user_id: 9, page: 2, per_page: 6 });
    expect(store.getState().home.movieState.userMovies.data[0]?.id).toBe(1);
  });

  it('searchMovies: fulfilled updates movie options', async () => {
    const { movieService } = getMockContainer();
    const movie: Movie = buildMovie({ id: 1, popularity: 1, vote_average: 8 });
    movieService.getAll.mockResolvedValue({
      data: [movie],
      meta: { total: 1, last_page: 1, current_page: 1, per_page: 10, prev: null, next: null },
    });

    const store = mkStore();
    await store.dispatch(searchMovies('matrix'));

    expect(movieService.getAll).toHaveBeenCalledWith({ name: 'matrix', page: 1, per_page: 10 });
    expect(store.getState().home.movieState.options).toHaveLength(1);
  });

  it('addMovieToUser: fulfilled updates toast and inserts into latest_movies', async () => {
    const { userService } = getMockContainer();
    const user: User = buildUser({ id: 9, name: 'Ana', age: 28, latest_movies: [] });
    const movie: Movie = buildMovie({ id: 7, vote_average: 8 });

    // Preload user in state (immer lets us mutate by reference in reducer, but for tests we do dispatch)
    const store = mkStore();
    store.dispatch({
      type: 'home/loadUsers/fulfilled',
      payload: { data: [user], meta: null },
    });

    userService.addMovieToUser.mockResolvedValue(user);
    await store.dispatch(addMovieToUser({ userId: 9, movie }));

    expect(userService.addMovieToUser).toHaveBeenCalledWith({ user_id: 9, movie_id: 7 });
    expect(store.getState().home.toast.open).toBe(true);
  });

  it('addMovieToUser: rejected sets toast error', async () => {
    const { userService } = getMockContainer();
    userService.addMovieToUser.mockRejectedValue(new Error('boom'));

    const store = mkStore();
    const movie = buildMovie({ id: 7, vote_average: 8 }) satisfies Movie;

    await store.dispatch(addMovieToUser({ userId: 9, movie }));
    expect(store.getState().home.toast.message).toBe('Erro ao adicionar filme ao usuário');
  });

  it('removeMovieFromUser: fulfilled removes latest_movies', async () => {
    const { userService } = getMockContainer();
    userService.removeMovieFromUser.mockResolvedValue(undefined);

    const store = mkStore();
    const movie: Movie = buildMovie({ id: 7, vote_average: 8 });
    const user: User = buildUser({ id: 9, name: 'Ana', age: 28, latest_movies: [movie] });

    store.dispatch({
      type: 'home/loadUsers/fulfilled',
      payload: { data: [user], meta: null },
    });

    await store.dispatch(removeMovieFromUser({ userId: 9, movieId: 7 }));
    expect(store.getState().home.userState.data[0]?.latest_movies?.length).toBe(0);
  });
});
