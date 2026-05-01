import type { Movie } from '@/services/movie/MovieService';
import type { User } from '@/services/user/user-service';

const releaseDate = new Date('1999-01-01T00:00:00.000Z');
const voteAverage = 8.2;
const voteCount = 100;

export const buildMovie = (overrides: Partial<Movie> = {}): Movie => ({
  id: 7,
  title: 'Matrix',
  external_id: 123,
  original_language: 'en',
  overview: 'x',
  popularity: 1,
  poster_path: null,
  adult: false,
  release_date: releaseDate.toISOString().slice(0, 10),
  vote_average: voteAverage,
  vote_count: voteCount,
  ...overrides,
});

export const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 9,
  name: 'Ana',
  age: 28,
  latest_movies: [],
  ...overrides,
});

