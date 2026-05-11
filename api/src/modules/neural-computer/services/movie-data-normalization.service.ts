import { Injectable } from '@nestjs/common';
import { Movie } from '@/generatedprisma/client';
import { decimalToNumber } from '@/shared/prisma/decimal-to-number';

export type MovieNormalizedFeatures = {
  movie_id: number;
  original_language: string;
  popularity: number;
  adult: boolean;
  vote_average: number;
};

@Injectable()
export class MovieDataNormalizationService {
  /**
   * Phase 1: only extract the raw numeric features we will normalize later.
   * Next phase will compute dataset stats (min/max/z-score) and apply them.
   */
  normalizeMovieFeatures(movie: Movie): MovieNormalizedFeatures {
    return {
      movie_id: movie.id,
      original_language: movie.original_language,
      popularity: movie.popularity,
      adult: movie.adult,
      vote_average: decimalToNumber(movie.vote_average) as unknown as number,
    };
  }

  normalizeMovies(movies: Movie[]): MovieNormalizedFeatures[] {
    return movies.map((m) => this.normalizeMovieFeatures(m));
  }
}
