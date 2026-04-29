import { z } from 'zod';

export const metaSchema = z.object({
  total: z.number(),
  last_page: z.number(),
  current_page: z.number(),
  per_page: z.number(),
  prev: z.number().nullable(),
  next: z.number().nullable(),
});

export const movieSchema = z.object({
  id: z.number(),
  title: z.string(),
  external_id: z.number(),
  original_language: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  adult: z.boolean(),
  release_date: z.string().or(z.date()),
  vote_average: z.number(),
  vote_count: z.number(),
});

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  age: z.number(),
  latest_movies: z.array(movieSchema).optional(),
});

export const listResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    data: z.array(item),
    meta: metaSchema,
  });

export const emptyObjectSchema = z.object({}).passthrough();
