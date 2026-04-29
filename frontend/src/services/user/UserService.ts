import { z } from 'zod';
import { listResponseSchema, movieSchema, userSchema } from '@/services/shared/schemas';
import type { AxiosInstance } from 'axios';

const usersResponseSchema = listResponseSchema(userSchema);
const userMoviesResponseSchema = listResponseSchema(movieSchema);

export type User = z.infer<typeof userSchema>;

export class UserService {
  constructor(private readonly httpClient: AxiosInstance) {}

  async getAll(params?: { page?: number; per_page?: number; name?: string }) {
    const { data } = await this.httpClient.get('/user', { params });
    return usersResponseSchema.parse(data);
  }

  async create(payload: { name: string; age: number }) {
    const { data } = await this.httpClient.post('/user', payload);
    return userSchema.parse(data);
  }

  async getMoviesByUserId(params: { user_id: number; page?: number; per_page?: number }) {
    const { data } = await this.httpClient.get('/user/movie', { params });
    return userMoviesResponseSchema.parse(data);
  }

  async addMovieToUser(payload: { user_id: number; movie_id: number }) {
    const response = await this.httpClient.post('/user/movie', payload);
    if (response.status === 204) return null;
    return userSchema.parse(response.data);
  }

  async removeMovieFromUser(payload: { user_id: number; movie_id: number }) {
    await this.httpClient.delete('/user/movie', { data: payload });
  }
}
