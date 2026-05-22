import type { Movie, User, UserMovie, Prisma } from '@/generatedprisma/client';

export type UserWithMoviesPayload = Prisma.UserGetPayload<{
  include: { movies: { include: { movie: true } } };
}>;

export type UserFindManyResult = Promise<Array<UserWithMoviesPayload>>;
export type UserFindUniqueResult = Promise<User | null>;
export type UserCreateResult = Promise<User>;
export type UserCountResult = Promise<number>;

export type MovieFindUniqueResult = Promise<{ id: number } | null>;
export type MovieFindManyResult = Promise<Movie[]>;

export type UserMovieFindUniqueResult = Promise<UserMovie | null>;
export type UserMovieDeleteResult = Promise<UserMovie>;
export type UserMovieFindManyResult = Promise<UserMovie[]>;
export type UserMovieCountResult = Promise<number>;

export type UserMovieCreateWithRelationsPayload = Prisma.UserMovieGetPayload<{
  include: { user: true; movie: true };
}>;

export type UserMovieCreateResult =
  Promise<UserMovieCreateWithRelationsPayload>;

export type MovieFindManyArgs = Prisma.MovieFindManyArgs;
export type UserFindManyArgs = Prisma.UserFindManyArgs;
export type UserMovieFindManyArgs = Prisma.UserMovieFindManyArgs;

// Resultado de getAllInteractions: só seleciona user_id e movie_id
export type InteractionFindManyResult = Promise<
  { user_id: number; movie_id: number }[]
>;
