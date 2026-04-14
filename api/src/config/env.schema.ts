import { z } from 'zod';

const portSchema = z.coerce.number().int().positive();

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: portSchema.default(3000),
  TMDB_TOKEN: z.string().min(1),
  TMDB_BASE_URL: z.string().url(),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_PORT: portSchema.default(5432),
  QDRANT_HOST: z.string().min(1).default('qdrant'),
  QDRANT_PORT: portSchema.default(6333),
});

export type EnvSchema = z.infer<typeof envSchema>;
