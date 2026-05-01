import type { Movie } from '@/generatedprisma/client';
import { Prisma } from '@/generatedprisma/client';

export type MovieFindManyResult = Promise<Movie[]>;
export type MovieFindUniqueResult = Promise<{ id: number } | null>;
export type MovieCreateResult = Promise<Movie>;
export type MovieCountResult = Promise<number>;
export type MovieFindFirstResult = Promise<{ release_date: Date } | null>;

export type MovieFindFirstArgs = Prisma.MovieFindFirstArgs;
export type MovieFindManyArgs = Prisma.MovieFindManyArgs;
export type MovieFindUniqueArgs = Prisma.MovieFindUniqueArgs;
export type MovieCreateArgs = Prisma.MovieCreateArgs;
export type MovieCountArgs = Prisma.MovieCountArgs;
