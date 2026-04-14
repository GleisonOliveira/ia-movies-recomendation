import { MovieService } from './MovieService';

describe('MovieService', () => {
  it('parses movies list response', async () => {
    const httpClient = {
      get: jest.fn().mockResolvedValue({
        data: {
          data: [
            {
              id: 1,
              title: 'Inception',
              external_id: 10,
              original_language: 'en',
              overview: '...',
              popularity: 10,
              poster_path: null,
              adult: false,
              release_date: '2010-01-01',
              vote_average: 8.8,
              vote_count: 10,
            },
          ],
          meta: { total: 1, last_page: 1, current_page: 1, per_page: 10, prev: null, next: null },
        },
      }),
    } as never;

    const service = new MovieService(httpClient);
    const response = await service.getAll();

    expect(response.data[0]?.title).toBe('Inception');
  });
});
