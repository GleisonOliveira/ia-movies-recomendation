import { UserService } from './user-service';
import type { AxiosInstance } from 'axios';

describe('UserService', () => {
  it('parses users list response', async () => {
    const httpClient = {
      get: jest.fn().mockResolvedValue({
        data: { data: [{ id: 1, name: 'Ana', age: 28 }], meta: { total: 1, last_page: 1, current_page: 1, per_page: 10, prev: null, next: null } },
      }),
    } as never;

    const service = new UserService(httpClient);
    const response = await service.getAll();

    expect(response.data[0]?.name).toBe('Ana');
  });

  it('creates a user', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        data: { id: 2, name: 'Bruno', age: 31 },
      }),
    } as unknown as AxiosInstance;

    const service = new UserService(httpClient);
    const response = await service.create({ name: 'Bruno', age: 31 });

    expect((httpClient.post as jest.Mock)).toHaveBeenCalledWith('/user', { name: 'Bruno', age: 31 });
    expect(response).toEqual({ id: 2, name: 'Bruno', age: 31 });
  });

  it('parses movies list by user id', async () => {
    const httpClient = {
      get: jest.fn().mockResolvedValue({
        data: {
          data: [
            {
              id: 10,
              title: 'Matrix',
              external_id: 123,
              original_language: 'en',
              overview: 'x',
              popularity: 1.23,
              poster_path: null,
              adult: false,
              release_date: '1999-01-01',
              vote_average: 8.2,
              vote_count: 100,
            },
          ],
          meta: {
            total: 1,
            last_page: 1,
            current_page: 1,
            per_page: 10,
            prev: null,
            next: null,
          },
        },
      }),
    };

    const service = new UserService(httpClient as unknown as AxiosInstance);
    const response = await service.getMoviesByUserId({ user_id: 1, page: 2, per_page: 5 });

    expect(httpClient.get).toHaveBeenCalledWith('/user/movie', { params: { user_id: 1, page: 2, per_page: 5 } });
    expect(response.data[0]?.title).toBe('Matrix');
  });

  it('returns null when adding movie returns 204', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        status: 204,
        data: null,
      }),
    };

    const service = new UserService(httpClient as unknown as AxiosInstance);
    const response = await service.addMovieToUser({ user_id: 1, movie_id: 10 });

    expect(httpClient.post).toHaveBeenCalledWith('/user/movie', { user_id: 1, movie_id: 10 });
    expect(response).toBeNull();
  });

  it('parses user when adding movie returns 200', async () => {
    const httpClient = {
      post: jest.fn().mockResolvedValue({
        status: 200,
        data: { id: 3, name: 'Ana', age: 28 },
      }),
    };

    const service = new UserService(httpClient as unknown as AxiosInstance);
    const response = await service.addMovieToUser({ user_id: 1, movie_id: 10 });

    expect(httpClient.post).toHaveBeenCalledWith('/user/movie', { user_id: 1, movie_id: 10 });
    expect(response).toEqual({ id: 3, name: 'Ana', age: 28 });
  });

  it('removes movie from user', async () => {
    const httpClient = {
      delete: jest.fn().mockResolvedValue({}),
    };

    const service = new UserService(httpClient as unknown as AxiosInstance);
    await service.removeMovieFromUser({ user_id: 1, movie_id: 10 });

    expect(httpClient.delete).toHaveBeenCalledWith('/user/movie', { data: { user_id: 1, movie_id: 10 } });
  });
});
