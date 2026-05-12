import type { Movie } from '@/generatedprisma/client';
import { Prisma } from '@/generatedprisma/client';

const releaseDate = new Date('2020-01-01T00:00:00.000Z');
const vote = new Prisma.Decimal(8.1);

export function buildMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 2,
    title: 'Movie 1',
    external_id: 1,
    original_language: 'en',
    overview: 'Overview',
    popularity: 1,
    poster_path: null,
    adult: false,
    release_date: releaseDate,
    vote_average: vote,
    vote_count: 1,
    ...overrides,
  };
}
