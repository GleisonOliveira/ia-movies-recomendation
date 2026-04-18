import { UserService } from './UserService';
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
});
