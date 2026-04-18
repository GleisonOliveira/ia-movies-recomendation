import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { z } from 'zod';
import type { Movie } from '@/services/movie/MovieService';
import type { User } from '@/services/user/UserService';
import type { PaginationMeta, UserMoviesState } from '@/ui/pages/home/types';
import { createAppContainer } from '@/shared/di/createAppContainer';

const container = createAppContainer();

const USERS_PER_PAGE = 8;
const MOVIES_PER_PAGE = 6;

const createUserModalSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do usuário'),
  age: z
    .string()
    .trim()
    .min(1, 'Informe a idade do usuário')
    .refine((value) => Number.isFinite(Number(value)), 'Informe uma idade válida')
    .refine((value) => Number(value) > 0, 'A idade deve ser maior que zero'),
});

type CreateUserModalErrors = {
  name: string | null;
  age: string | null;
};

type HomeState = {
  selectedUser: User | null;
  createUserModal: {
    open: boolean;
    name: string;
    age: string;
    submitting: boolean;
    errors: CreateUserModalErrors;
  };
  toast: {
    open: boolean;
    message: string;
    severity: 'error' | 'success' | 'info' | 'warning';
  };
  userState: {
    loading: boolean;
    error: string | null;
    data: User[];
    meta: PaginationMeta;
    page: number;
  };
  movieState: {
    userMovies: UserMoviesState;
    userMoviesPage: number;
    query: string;
    options: Movie[];
    loading: boolean;
    selected: Movie | null;
  };
};

const initialState: HomeState = {
  selectedUser: null,
  createUserModal: {
    open: false,
    name: '',
    age: '',
    submitting: false,
    errors: {
      name: null,
      age: null,
    },
  },
  toast: {
    open: false,
    message: '',
    severity: 'error',
  },
  userState: {
    loading: true,
    error: null,
    data: [],
    meta: null,
    page: 1,
  },
  movieState: {
    userMovies: { loading: false, error: null, data: [], meta: null },
    userMoviesPage: 1,
    query: '',
    options: [],
    loading: false,
    selected: null,
  },
};

export const loadUsers = createAsyncThunk('home/loadUsers', async (page: number) => {
  return container.userService.getAll({ page, per_page: USERS_PER_PAGE });
});

export const createUser = createAsyncThunk(
  'home/createUser',
  async (payload: { name: string; age: number }, thunkApi) => {
    const createdUser = await container.userService.create(payload);
    const state = thunkApi.getState() as { home: HomeState };
    await thunkApi.dispatch(loadUsers(state.home.userState.page));
    return createdUser;
  },
);

export const submitCreateUserModal = createAsyncThunk(
  'home/submitCreateUserModal',
  async (_, thunkApi) => {
    const state = thunkApi.getState() as { home: HomeState };
    const { name, age } = state.home.createUserModal;
    const parsed = createUserModalSchema.safeParse({ name, age });

    if (!parsed.success) {
      return thunkApi.rejectWithValue(
        parsed.error.flatten().fieldErrors,
      );
    }

    const result = await thunkApi.dispatch(createUser({
      name: parsed.data.name.trim(),
      age: Number(parsed.data.age),
    }));
    return result;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { home: HomeState };
      return !state.home.createUserModal.submitting;
    },
  },
);

export const loadUserMovies = createAsyncThunk('home/loadUserMovies', async (args: { userId: number; page: number }) => {
  return container.userService.getMoviesByUserId({
    user_id: args.userId,
    page: args.page,
    per_page: MOVIES_PER_PAGE,
  });
});

export const searchMovies = createAsyncThunk('home/searchMovies', async (query: string) => {
  return container.movieService.getAll({ name: query, page: 1, per_page: 10 });
});

export const addMovieToUser = createAsyncThunk('home/addMovieToUser', async (args: { userId: number; movieId: number }) => {
  return container.userService.addMovieToUser({ user_id: args.userId, movie_id: args.movieId });
});

export const removeMovieFromUser = createAsyncThunk('home/removeMovieFromUser', async (args: { userId: number; movieId: number }) => {
  return container.userService.removeMovieFromUser({ user_id: args.userId, movie_id: args.movieId });
});

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.selectedUser = action.payload;
      state.movieState.userMoviesPage = 1;
    },
    openCreateUserModal(state) {
      state.createUserModal.open = true;
    },
    closeCreateUserModal(state) {
      state.createUserModal.open = false;
      state.createUserModal.name = '';
      state.createUserModal.age = '';
      state.createUserModal.submitting = false;
      state.createUserModal.errors = { name: null, age: null };
    },
    setCreateUserName(state, action: PayloadAction<string>) {
      state.createUserModal.name = action.payload;
      state.createUserModal.errors.name = null;
    },
    setCreateUserAge(state, action: PayloadAction<string>) {
      state.createUserModal.age = action.payload;
      state.createUserModal.errors.age = null;
    },
    closeDrawer(state) {
      state.selectedUser = null;
    },
    setUsersPage(state, action: PayloadAction<number>) {
      state.userState.page = action.payload;
    },
    setUserMoviesPage(state, action: PayloadAction<number>) {
      state.movieState.userMoviesPage = action.payload;
    },
    setMovieQuery(state, action: PayloadAction<string>) {
      state.movieState.query = action.payload;
      if (!action.payload.trim()) {
        state.movieState.options = [];
        state.movieState.selected = null;
      }
    },
    setSelectedMovie(state, action: PayloadAction<Movie | null>) {
      state.movieState.selected = action.payload;
    },
    closeToast(state) {
      state.toast.open = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.pending, (state) => {
        state.userState.loading = true;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.userState.loading = false;
        state.userState.error = null;
        state.userState.data = action.payload.data;
        state.userState.meta = action.payload.meta;
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.userState.loading = false;
        state.userState.error = action.error.message ?? 'Erro ao carregar usuários';
        state.toast = {
          open: true,
          message: action.error.message ?? 'Erro ao carregar usuários',
          severity: 'error',
        };
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createUserModal.submitting = false;
        state.createUserModal.open = false;
        state.createUserModal.name = '';
        state.createUserModal.age = '';
        state.toast = {
          open: true,
          message: `Usuário ${action.payload.name} cadastrado com sucesso`,
          severity: 'success',
        };
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createUserModal.submitting = false;
        state.toast = {
          open: true,
          message: action.error.message ?? 'Erro ao cadastrar usuário',
          severity: 'error',
        };
      })
      .addCase(createUser.pending, (state) => {
        state.createUserModal.submitting = true;
      })
      .addCase(submitCreateUserModal.rejected, (state, action) => {
        state.createUserModal.submitting = false;
        const fieldErrors = action.payload as Partial<Record<'name' | 'age', string[]>> | undefined;
        state.createUserModal.errors = {
          name: fieldErrors?.name?.[0] ?? null,
          age: fieldErrors?.age?.[0] ?? null,
        };
      })
      .addCase(loadUserMovies.pending, (state) => {
        state.movieState.userMovies.loading = true;
      })
      .addCase(loadUserMovies.fulfilled, (state, action) => {
        state.movieState.userMovies.loading = false;
        state.movieState.userMovies.error = null;
        state.movieState.userMovies.data = action.payload.data;
        state.movieState.userMovies.meta = action.payload.meta;
      })
      .addCase(loadUserMovies.rejected, (state, action) => {
        state.movieState.userMovies.loading = false;
        state.movieState.userMovies.error = action.error.message ?? 'Erro ao carregar filmes do usuário';
        state.toast = {
          open: true,
          message: action.error.message ?? 'Erro ao carregar filmes do usuário',
          severity: 'error',
        };
      })
      .addCase(searchMovies.pending, (state) => {
        state.movieState.loading = true;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.movieState.loading = false;
        state.movieState.options = action.payload.data;
      })
      .addCase(searchMovies.rejected, (state) => {
        state.movieState.loading = false;
        state.movieState.options = [];
        state.toast = {
          open: true,
          message: 'Erro ao buscar filmes',
          severity: 'error',
        };
      })
      .addCase(addMovieToUser.rejected, (state) => {
        state.toast = {
          open: true,
          message: 'Erro ao adicionar filme ao usuário',
          severity: 'error',
        };
      })
      .addCase(addMovieToUser.fulfilled, (state, action) => {
        state.toast = {
          open: true,
          message: action.payload ? 'Filme associado ao usuário' : 'Filme já estava associado ao usuário',
          severity: 'success',
        };
      })
      .addCase(removeMovieFromUser.rejected, (state) => {
        state.toast = {
          open: true,
          message: 'Erro ao remover filme do usuário',
          severity: 'error',
        };
      });
  },
});

export const { setSelectedUser, closeDrawer, setUsersPage, setUserMoviesPage, setMovieQuery, setSelectedMovie } =
  homeSlice.actions;
export const { openCreateUserModal, closeCreateUserModal, setCreateUserName, setCreateUserAge } = homeSlice.actions;
export const { closeToast } = homeSlice.actions;

export const homeReducer = homeSlice.reducer;
