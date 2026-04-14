import { z } from 'zod';
import { movieSchema, listResponseSchema } from '@/services/shared/schemas';
import type { AxiosInstance } from 'axios';

const moviesResponseSchema = listResponseSchema(movieSchema);
export type Movie = z.infer<typeof movieSchema>;

export class MovieService {
  constructor(private readonly httpClient: AxiosInstance) {}

  async getAll(params?: { page?: number; per_page?: number; name?: string }) {
    const { data } = await this.httpClient.get('/movie', { params });
    return moviesResponseSchema.parse(data);
  }
}
