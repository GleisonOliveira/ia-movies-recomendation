import { createAsyncThunk } from '@reduxjs/toolkit';
import { z } from 'zod';
import type { Movie } from '@/services/movie/MovieService';
import type { User } from '@/services/user/user-service';
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

export const loadUsers = createAsyncThunk('home/loadUsers', async (page: number) => {
  return container.userService.getAll({ page, per_page: USERS_PER_PAGE });
});

export const createUser = createAsyncThunk(
  'home/createUser',
  async (payload: { name: string; age: number }, thunkApi) => {
    const createdUser = await container.userService.create(payload);
    const state = thunkApi.getState() as { home: { userState: { page: number } } };
    await thunkApi.dispatch(loadUsers(state.home.userState.page));
    return createdUser;
  },
);

export const submitCreateUserModal = createAsyncThunk(
  'home/submitCreateUserModal',
  async (_, thunkApi) => {
    const state = thunkApi.getState() as {
      home: {
        createUserModal: { name: string; age: string; submitting: boolean };
      };
    };
    const { name, age } = state.home.createUserModal;
    const parsed = createUserModalSchema.safeParse({ name, age });

    if (!parsed.success) {
      return thunkApi.rejectWithValue(parsed.error.flatten().fieldErrors);
    }

    const result = await thunkApi.dispatch(
      createUser({
        name: parsed.data.name.trim(),
        age: Number(parsed.data.age),
      }),
    );
    return result;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as {
        home: { createUserModal: { submitting: boolean } };
      };
      return !state.home.createUserModal.submitting;
    },
  },
);

export const loadUserMovies = createAsyncThunk(
  'home/loadUserMovies',
  async (args: { userId: number; page: number }) => {
    return container.userService.getMoviesByUserId({
      user_id: args.userId,
      page: args.page,
      per_page: MOVIES_PER_PAGE,
    });
  },
);

export const searchMovies = createAsyncThunk(
  'home/searchMovies',
  async (query: string) => {
    return container.movieService.getAll({ name: query, page: 1, per_page: 10 });
  },
);

export const loadRecommendations = createAsyncThunk(
  'home/loadRecommendations',
  async (userId: number) => {
    const result = await container.userService.getRecommendations(userId);
    return result.data;
  },
);

export const addMovieToUser = createAsyncThunk(
  'home/addMovieToUser',
  async (args: { userId: number; movie: Movie; perPage?: number }) => {
    const user = await container.userService.addMovieToUser({
      user_id: args.userId,
      movie_id: args.movie.id,
    });
    return { user, movie: args.movie, perPage: args.perPage ?? 6 };
  },
);

export const removeMovieFromUser = createAsyncThunk(
  'home/removeMovieFromUser',
  async (args: { userId: number; movieId: number }) => {
    await container.userService.removeMovieFromUser({
      user_id: args.userId,
      movie_id: args.movieId,
    });
  },
);

export type { User };
