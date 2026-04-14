import { UserService } from './UserService';

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
});
