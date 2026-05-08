import { configureStore } from '@reduxjs/toolkit';
import { createAppContainer } from '@/shared/di/createAppContainer';
import {
  userReducer,
  closeCreateUserModal,
  closeToast,
  openCreateUserModal,
  setCreateUserAge,
  setCreateUserName,
  setMovieQuery,
  setSelectedMovie,
  setSelectedUser,
  setUserMoviesPage,
} from './usersSlice';
import type { Movie } from '@/services/movie/MovieService';
import type { User } from '@/services/user/user-service';
import {
  loadUsers,
  createUser,
  loadUserMovies,
  searchMovies,
  addMovieToUser,
  removeMovieFromUser,
  submitCreateUserModal,
} from '@/store/home/usersThunks';

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
} from '@/test/store/home/usersThunksTypes';

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
      home: userReducer,
    },
  });

describe('homeSlice', () => {
  it('initialState matches expected defaults', () => {
    const store = mkStore();
    const state = store.getState().home;

    expect(state.selectedUser).toBeNull();
    expect(state.createUserModal).toEqual({
      open: false,
      name: '',
      age: '',
      submitting: false,
      errors: { name: null, age: null },
    });
    expect(state.toast).toEqual({
      open: false,
      message: '',
      severity: 'error',
    });
    expect(state.userState).toEqual({
      loading: true,
      error: null,
      data: [],
      meta: null,
      page: 1,
    });
    expect(state.movieState).toEqual({
      userMovies: { loading: false, error: null, data: [], meta: null },
      userMoviesPage: 1,
      query: '',
      options: [],
      loading: false,
      selected: null,
    });
  });

  describe('sync reducers', () => {
    it('setSelectedUser resets movieState.userMoviesPage to 1', () => {
      const store = mkStore();
      const user = buildUser();

      store.dispatch(setUserMoviesPage(3));
      store.dispatch(setSelectedUser(user));

      expect(store.getState().home.selectedUser).toEqual(user);
      expect(store.getState().home.movieState.userMoviesPage).toBe(1);
    });

    it('openCreateUserModal/closeCreateUserModal resets modal fields', () => {
      const store = mkStore();
      store.dispatch(openCreateUserModal());
      store.dispatch(setCreateUserName('Ana'));
      store.dispatch(setCreateUserAge('30'));
      store.dispatch({ type: 'home/createUser/pending' }); // ensure submitting can be reset

      store.dispatch(closeCreateUserModal());

      expect(store.getState().home.createUserModal).toEqual({
        open: false,
        name: '',
        age: '',
        submitting: false,
        errors: { name: null, age: null },
      });
    });

    it('setCreateUserName clears only errors.name', () => {
      const store = mkStore();
      store.dispatch({
        type: 'home/submitCreateUserModal/rejected',
        payload: { name: ['err-name'], age: ['err-age'] },
      });

      store.dispatch(setCreateUserName('Ana'));

      expect(store.getState().home.createUserModal.errors).toEqual({
        name: null,
        age: 'err-age',
      });
    });

    it('setCreateUserAge clears only errors.age', () => {
      const store = mkStore();
      store.dispatch({
        type: 'home/submitCreateUserModal/rejected',
        payload: { name: ['err-name'], age: ['err-age'] },
      });

      store.dispatch(setCreateUserAge('30'));

      expect(store.getState().home.createUserModal.errors).toEqual({
        name: 'err-name',
        age: null,
      });
    });

    it('setMovieQuery clears options/selected when query is whitespace', () => {
      const store = mkStore();
      const movie: Movie = buildMovie({ id: 1 });

      store.dispatch({
        type: 'home/searchMovies/fulfilled',
        payload: { data: [movie], meta: null },
      });
      store.dispatch(setSelectedMovie(movie));
      store.dispatch(setMovieQuery('   '));

      expect(store.getState().home.movieState.options).toHaveLength(0);
      expect(store.getState().home.movieState.selected).toBeNull();
    });

    it('closeToast sets toast.open=false', () => {
      const store = mkStore();
      store.dispatch({ type: 'home/loadUsers/rejected', error: { message: 'boom' } });
      expect(store.getState().home.toast.open).toBe(true);
      store.dispatch(closeToast());
      expect(store.getState().home.toast.open).toBe(false);
    });
  });

  describe('extraReducers via real thunks', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('loadUsers.pending/fulfilled updates userState', async () => {
      const { userService } = getMockContainer();
      const users: User[] = [buildUser({ id: 1, name: 'Ana', age: 28, latest_movies: [] })];
      const meta = { total: 1, last_page: 1, current_page: 1, per_page: 8, prev: null, next: null };

      userService.getAll.mockResolvedValue({
        data: users,
        meta,
      });

      const store = mkStore();
      await store.dispatch(loadUsers(2));

      expect(userService.getAll).toHaveBeenCalledWith({ page: 2, per_page: 8 });
      expect(store.getState().home.userState).toEqual({
        loading: false,
        error: null,
        data: users,
        meta,
        page: 1,
      });
    });

    it('loadUsers.rejected sets toast error and userState.error', async () => {
      const { userService } = getMockContainer();
      userService.getAll.mockRejectedValue(new Error('boom'));

      const store = mkStore();
      await store.dispatch(loadUsers(1));

      expect(store.getState().home.userState.loading).toBe(false);
      expect(store.getState().home.userState.error).toBe('boom');
      expect(store.getState().home.toast).toEqual({
        open: true,
        message: 'boom',
        severity: 'error',
      });
    });

    it('createUser.pending/fulfilled closes modal and shows success toast', async () => {
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

      const { createUserModal, toast } = store.getState().home;
      expect(createUserModal.open).toBe(false);
      expect(createUserModal.name).toBe('');
      expect(createUserModal.age).toBe('');
      expect(createUserModal.submitting).toBe(false);
      expect(toast.open).toBe(true);
      expect(toast.severity).toBe('success');
      expect(toast.message).toBe('Usuário Bruno cadastrado com sucesso');
    });

    it('submitCreateUserModal.rejected maps Zod field errors into createUserModal.errors', async () => {
      const { userService } = getMockContainer();
      userService.create.mockResolvedValue(buildUser());

      const store = mkStore();
      store.dispatch(openCreateUserModal());
      store.dispatch(setCreateUserName('')); // invalid
      store.dispatch(setCreateUserAge('-1')); // invalid

      await store.dispatch(submitCreateUserModal());

      expect(userService.create).not.toHaveBeenCalled();
      expect(store.getState().home.createUserModal.errors).toEqual({
        name: 'Informe o nome do usuário',
        age: 'A idade deve ser maior que zero',
      });
    });

    it('loadUserMovies.fulfilled updates movieState.userMovies', async () => {
      const { userService } = getMockContainer();
      const movie: Movie = buildMovie({ id: 1 });

      userService.getMoviesByUserId.mockResolvedValue({
        data: [movie],
        meta: { total: 1, last_page: 1, current_page: 1, per_page: 6, prev: null, next: null },
      });

      const store = mkStore();
      await store.dispatch(loadUserMovies({ userId: 9, page: 2 }));

      expect(userService.getMoviesByUserId).toHaveBeenCalledWith({ user_id: 9, page: 2, per_page: 6 });
      expect(store.getState().home.movieState.userMovies.data[0]?.id).toBe(1);
    });

    it('searchMovies.fulfilled updates movieState.options', async () => {
      const { movieService } = getMockContainer();
      const movie: Movie = buildMovie({ id: 1 });

      movieService.getAll.mockResolvedValue({
        data: [movie],
        meta: { total: 1, last_page: 1, current_page: 1, per_page: 10, prev: null, next: null },
      });

      const store = mkStore();
      await store.dispatch(searchMovies('matrix'));

      expect(movieService.getAll).toHaveBeenCalledWith({ name: 'matrix', page: 1, per_page: 10 });
      expect(store.getState().home.movieState.options).toHaveLength(1);
    });

    it('addMovieToUser.fulfilled prepends into latest_movies (dedupe + max 5) and shows toast', async () => {
      const { userService } = getMockContainer();
      const movie: Movie = buildMovie({ id: 7 });

      const existing1: Movie = buildMovie({ id: 1 });
      const existing2: Movie = buildMovie({ id: 2 });
      const existing3: Movie = buildMovie({ id: 3 });
      const existing4: Movie = buildMovie({ id: 4 });
      const existing5: Movie = buildMovie({ id: 5 });
      const user: User = buildUser({
        id: 9,
        latest_movies: [existing1, existing2, existing3, existing4, existing5],
      });

      userService.addMovieToUser.mockResolvedValue(user);

      const store = mkStore();
      store.dispatch({
        type: 'home/loadUsers/fulfilled',
        payload: { data: [user], meta: null },
      });

      await store.dispatch(addMovieToUser({ userId: 9, movie }));

      const updatedUser = store.getState().home.userState.data[0];
      const latest = updatedUser?.latest_movies ?? [];
      expect(latest).toHaveLength(5);
      expect(latest[0]!.id).toBe(7);
      expect(store.getState().home.toast.severity).toBe('success');
      expect(store.getState().home.toast.open).toBe(true);
    });

    it('removeMovieFromUser.fulfilled removes latest_movies by meta.arg and uses original meta', async () => {
      const { userService } = getMockContainer();
      userService.removeMovieFromUser.mockResolvedValue(undefined);

      const movieRemove: Movie = buildMovie({ id: 7 });
      const movieKeep: Movie = buildMovie({ id: 8 });
      const user: User = buildUser({ id: 9, latest_movies: [movieRemove, movieKeep] });

      const store = mkStore();
      store.dispatch({
        type: 'home/loadUsers/fulfilled',
        payload: { data: [user], meta: null },
      });

      // removeMovieFromUser fulfilled relies on action.meta.arg
      await store.dispatch(removeMovieFromUser({ userId: 9, movieId: 7 }));

      const updatedUser = store.getState().home.userState.data[0];
      expect(updatedUser?.latest_movies ?? []).toHaveLength(1);
      expect(updatedUser?.latest_movies?.[0]?.id).toBe(8);
    });
  });
});
