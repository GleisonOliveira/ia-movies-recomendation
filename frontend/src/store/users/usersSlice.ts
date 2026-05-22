import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Movie } from '@/services/movie/MovieService';
import type { User } from '@/services/user/user-service';
import type { PaginationMeta, UserMoviesState } from '@/ui/components/home/_shared/types';
import {
  addMovieToUser,
  createUser,
  loadRecommendations,
  loadUserMovies,
  loadUsers,
  removeMovieFromUser,
  searchMovies,
  submitCreateUserModal,
} from '@/store/home/usersThunks';

export {
  addMovieToUser,
  createUser,
  loadRecommendations,
  loadUserMovies,
  loadUsers,
  removeMovieFromUser,
  searchMovies,
  submitCreateUserModal,
};

type CreateUserModalErrors = {
  name: string | null;
  age: string | null;
};

export type HomeState = {
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
    recommendations: {
      loading: boolean;
      data: Movie[];
    };
  };
};

export function createInitialHomeState(): HomeState {
  return {
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
      recommendations: { loading: false, data: [] },
    },
  };
}

const usersSlice = createSlice({
  name: 'home',
  initialState: createInitialHomeState(),
  reducers: {
    resetHomeState() {
      return createInitialHomeState();
    },
    setToast(
      state,
      action: PayloadAction<{ open: boolean; message: string; severity: 'error' | 'success' | 'info' | 'warning' }>,
    ) {
      state.toast = action.payload;
    },
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
        state.userState.data = action.payload.data;
        state.userState.meta = action.payload.meta;
        state.userState.error = null;
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
        const payloadUser = action.payload?.user;
        const payloadMovie = action.payload?.movie;
        const perPage = action.payload?.perPage ?? 6;
        if (payloadUser && payloadMovie) {
          const insertLatest = (movies: typeof payloadUser.latest_movies) => {
            const next = (movies ?? []).filter((m) => m.id !== payloadMovie.id);
            return [payloadMovie, ...next].slice(0, 5);
          };

          // Atualiza lista principal
          state.userState.data = state.userState.data.map((u) =>
            u.id === payloadUser.id
              ? { ...u, latest_movies: insertLatest(u.latest_movies) }
              : u,
          );

          // Atualiza userMovies do drawer sem chamar endpoint
          const currentData = state.movieState.userMovies.data;
          const alreadyInPage = currentData.some((m) => m.id === payloadMovie.id);
          if (!alreadyInPage) {
            const newData = [payloadMovie, ...currentData.filter((m) => m.id !== payloadMovie.id)];
            const currentMeta = state.movieState.userMovies.meta;
            const newTotal = (currentMeta?.total ?? currentData.length) + 1;
            const newLastPage = Math.ceil(newTotal / perPage);
            state.movieState.userMovies.data = newData.slice(0, perPage);
            if (currentMeta) {
              state.movieState.userMovies.meta = {
                ...currentMeta,
                total: newTotal,
                last_page: newLastPage,
              };
            }
          }

          // Remove da lista de recomendações
          state.movieState.recommendations.data = state.movieState.recommendations.data.filter(
            (m) => m.id !== payloadMovie.id,
          );
        }
        state.toast = {
          open: true,
          message: action.payload ? 'Filme associado ao usuário' : 'Filme já estava associado ao usuário',
          severity: 'success',
        };
      })
      .addCase(loadRecommendations.pending, (state) => {
        state.movieState.recommendations.loading = true;
      })
      .addCase(loadRecommendations.fulfilled, (state, action) => {
        state.movieState.recommendations.loading = false;
        state.movieState.recommendations.data = action.payload;
      })
      .addCase(loadRecommendations.rejected, (state) => {
        state.movieState.recommendations.loading = false;
        state.movieState.recommendations.data = [];
      })
      .addCase(removeMovieFromUser.rejected, (state) => {
        state.toast = {
          open: true,
          message: 'Erro ao remover filme do usuário',
          severity: 'error',
        };
      })
      .addCase(removeMovieFromUser.fulfilled, (state, action) => {
        const args = action.meta.arg as { userId: number; movieId: number };
        const { userId, movieId } = args ?? { userId: -1, movieId: -1 };

        state.userState.data = state.userState.data.map((u) =>
          u.id === userId
            ? {
              ...u,
              latest_movies: (u.latest_movies ?? []).filter(
                (m) => m.id !== movieId,
              ),
            }
            : u,
        );
      });
  },
});

export const {
  resetHomeState,
  setSelectedUser,
  closeDrawer,
  setUsersPage,
  setUserMoviesPage,
  setMovieQuery,
  setSelectedMovie,
  setToast,
} = usersSlice.actions;
export const {
  openCreateUserModal,
  closeCreateUserModal,
  setCreateUserName,
  setCreateUserAge,
} = usersSlice.actions;
export const { closeToast } = usersSlice.actions;

export const userReducer = usersSlice.reducer;
