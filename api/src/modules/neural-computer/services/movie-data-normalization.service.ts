import { Injectable } from '@nestjs/common';
import { Movie } from '@/generatedprisma/client';
import { decimalToNumber } from '@/shared/prisma/decimal-to-number';

export type MovieRawFeatures = {
  movie_id: number;
  original_language: string;
  popularity: number;
  adult: boolean;
  vote_average: number;
};

export type MovieFeatureAggregates = {
  popularityMin: number;
  popularityMax: number;
  voteAverageMin: number;
  voteAverageMax: number;
  languageToIndex: Record<string, number>;
};

export type MovieTensorFeatures = {
  movie_id: number;
  popularity: number;
  adult: number; // 0/1
  vote_average: number;
  original_language_index: number;
};

@Injectable()
export class MovieDataNormalizationService {
  #getMovieFields(movie: Movie): MovieRawFeatures {
    return {
      movie_id: movie.id,
      original_language: movie.original_language,
      popularity: movie.popularity,
      adult: movie.adult,
      vote_average: decimalToNumber(movie.vote_average) as unknown as number,
    };
  }

  createEmptyMovieFeatureAggregates(): {
    popularityMin: number | null;
    popularityMax: number | null;
    voteAverageMin: number | null;
    voteAverageMax: number | null;
    languageToIndex: Record<string, number>;
  } {
    return {
      popularityMin: null,
      popularityMax: null,
      voteAverageMin: null,
      voteAverageMax: null,
      languageToIndex: {},
    };
  }

  updateMovieFeatureAggregates(
    agg: ReturnType<
      MovieDataNormalizationService['createEmptyMovieFeatureAggregates']
    >,
    movie: Movie,
  ): void {
    const { popularity, original_language, vote_average } =
      this.#getMovieFields(movie);

    agg.popularityMin =
      agg.popularityMin === null
        ? popularity
        : Math.min(agg.popularityMin, popularity);
    agg.popularityMax =
      agg.popularityMax === null
        ? popularity
        : Math.max(agg.popularityMax, popularity);

    agg.voteAverageMin =
      agg.voteAverageMin === null
        ? vote_average
        : Math.min(agg.voteAverageMin, vote_average);
    agg.voteAverageMax =
      agg.voteAverageMax === null
        ? vote_average
        : Math.max(agg.voteAverageMax, vote_average);

    if (agg.languageToIndex[original_language] === undefined) {
      const nextIndex = Object.keys(agg.languageToIndex).length;
      agg.languageToIndex[original_language] = nextIndex;
    }
  }

  finalizeMovieFeatureAggregates(
    agg: ReturnType<
      MovieDataNormalizationService['createEmptyMovieFeatureAggregates']
    >,
  ): MovieFeatureAggregates {
    return {
      popularityMin: agg.popularityMin ?? 0,
      popularityMax: agg.popularityMax ?? 0,
      voteAverageMin: agg.voteAverageMin ?? 0,
      voteAverageMax: agg.voteAverageMax ?? 0,
      languageToIndex: agg.languageToIndex,
    };
  }

  normalizeMovieForTensor(
    movie: Movie,
    aggregates: MovieFeatureAggregates,
  ): MovieTensorFeatures {
    const raw = this.#getMovieFields(movie);

    // Normalização min-max para colocar o valor entre 0 e 1:
    // popularity = (raw.popularity - popularityMin) / (popularityMax - popularityMin)
    // Exemplo: popularityMin=0.5, popularityMax=1.0, raw.popularity=0.75 => (0.75-0.5)/(1.0-0.5)=0.5
    const popularityRange =
      aggregates.popularityMax - aggregates.popularityMin || 1;
    const voteAverageRange =
      aggregates.voteAverageMax - aggregates.voteAverageMin || 1;

    // Mesma ideia para vote_average:
    // vote_average = (raw.vote_average - voteAverageMin) / (voteAverageMax - voteAverageMin)
    // Exemplo: voteAverageMin=5, voteAverageMax=9, raw=7 => (7-5)/(9-5)=0.5
    const popularity =
      (raw.popularity - aggregates.popularityMin) / popularityRange;
    const vote_average =
      (raw.vote_average - aggregates.voteAverageMin) / voteAverageRange;

    const original_language_index =
      aggregates.languageToIndex[raw.original_language] ??
      aggregates.languageToIndex['__UNK__'] ??
      0;

    return {
      movie_id: raw.movie_id,
      popularity,
      adult: raw.adult ? 1 : 0,
      vote_average,
      original_language_index,
    };
  }
}
