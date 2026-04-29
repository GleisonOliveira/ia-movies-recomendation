import { z } from 'zod';

const envSchema = z.object({
  API_URL: z.string().min(1),
  TMDB_IMAGE_PATH: z.string().min(1),
});

export const env = envSchema.parse({
  API_URL: (import.meta.env as Record<string, string | undefined>).VITE_API_URL,
  TMDB_IMAGE_PATH: (import.meta.env as Record<string, string | undefined>)
    .VITE_TMDB_IMAGE_PATH,
});
