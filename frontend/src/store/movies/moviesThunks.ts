import { createAsyncThunk } from '@reduxjs/toolkit';
import { z } from 'zod';
import type { Movie } from '@/services/movie/MovieService';
import { createAppContainer } from '@/shared/di/createAppContainer';

const container = createAppContainer();

const MOVIES_PER_PAGE = 12;

export const loadMovies = createAsyncThunk(
  'movies/loadMovies',
  async (args: { page: number; name?: string }, thunkApi) => {
    const parsed = z
      .object({
        page: z.number().int().min(1),
        name: z.string().optional(),
      })
      .safeParse(args);

    if (!parsed.success) {
      return thunkApi.rejectWithValue('Parâmetros inválidos');
    }

    const result = await container.movieService.getAll({
      page: parsed.data.page,
      per_page: MOVIES_PER_PAGE,
      name: parsed.data.name?.trim() ? parsed.data.name.trim() : undefined,
    });

    return result as { data: Movie[]; meta: { last_page: number } };
  },
);

