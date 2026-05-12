import { MovieDataNormalizationService } from './movie-data-normalization.service';
import { Movie } from '@/generatedprisma/client';

describe('MovieDataNormalizationService.createEmptyMovieFeatureAggregates', () => {
  it('should return null min/max values and an empty languageToIndex map', () => {
    const service = new MovieDataNormalizationService();

    const agg = service.createEmptyMovieFeatureAggregates();

    expect(agg).toEqual({
      popularityMin: null,
      popularityMax: null,
      voteAverageMin: null,
      voteAverageMax: null,
      languageToIndex: {},
    });
  });
});

describe('MovieDataNormalizationService.updateMovieFeatureAggregates', () => {
  it('should initialize aggregates when they are empty and a film is provided', () => {
    const service = new MovieDataNormalizationService();
    const agg = service.createEmptyMovieFeatureAggregates();

    const movie = {
      id: 1,
      original_language: 'en',
      popularity: 0.8,
      adult: false,
      vote_average: { toNumber: () => 4.2 },
    } as Movie;

    service.updateMovieFeatureAggregates(agg, movie);

    expect(agg).toEqual({
      popularityMin: 0.8,
      popularityMax: 0.8,
      voteAverageMin: 4.2,
      voteAverageMax: 4.2,
      languageToIndex: { en: 0 },
    });
  });

  it('should update min/max and extend languageToIndex when aggregates already have values', () => {
    const service = new MovieDataNormalizationService();
    const agg = service.createEmptyMovieFeatureAggregates();

    const movieA = {
      id: 1,
      original_language: 'en',
      popularity: 0.8,
      adult: false,
      vote_average: { toNumber: () => 4.2 },
    } as Movie;

    service.updateMovieFeatureAggregates(agg, movieA);

    const movieB = {
      id: 2,
      original_language: 'es',
      popularity: 0.3,
      adult: true,
      vote_average: { toNumber: () => 3.8 },
    } as Movie;

    service.updateMovieFeatureAggregates(agg, movieB);

    expect(agg).toEqual({
      popularityMin: 0.3,
      popularityMax: 0.8,
      voteAverageMin: 3.8,
      voteAverageMax: 4.2,
      languageToIndex: { en: 0, es: 1 },
    });
  });
});

describe('MovieDataNormalizationService.finalizeMovieFeatureAggregates', () => {
  it('should return the same aggregates values and languageToIndex map', () => {
    const service = new MovieDataNormalizationService();

    const agg = {
      popularityMin: 0.12,
      popularityMax: 0.99,
      voteAverageMin: 2.3,
      voteAverageMax: 8.8,
      languageToIndex: {
        en: 0,
        es: 1,
      },
    };

    const finalized = service.finalizeMovieFeatureAggregates(agg);

    expect(finalized).toEqual(agg);
  });
});

describe('MovieDataNormalizationService.normalizeMovieForTensor', () => {
  it('normalizes popularity and vote_average to [0,1] using aggregates', () => {
    const service = new MovieDataNormalizationService();

    const movie = {
      id: 123,
      original_language: 'en',
      popularity: 0.75,
      adult: false,
      vote_average: 7,
    } as unknown as Movie;

    const aggregates = {
      popularityMin: 0.5,
      popularityMax: 1,
      voteAverageMin: 5,
      voteAverageMax: 9,
      languageToIndex: { en: 3, __UNK__: 0 },
    };

    const out = service.normalizeMovieForTensor(movie, aggregates);

    expect(out.movie_id).toBe(123);
    expect(out.popularity).toBe(0.5);
    expect(out.adult).toBe(0);
    expect(out.vote_average).toBe((7 - 5) / (9 - 5));
    expect(out.original_language_index).toBe(3);
  });

  it('uses original_language_index with fallback to __UNK__, then 0', () => {
    const service = new MovieDataNormalizationService();

    const movieUnknown = {
      id: 1,
      original_language: 'xx',
      popularity: 0.75,
      adult: true,
      vote_average: 5,
    } as unknown as Movie;

    const aggregatesWithUnk = {
      popularityMin: 0.5,
      popularityMax: 1,
      voteAverageMin: 1,
      voteAverageMax: 9,
      languageToIndex: { en: 2, __UNK__: 7 },
    };

    const out1 = service.normalizeMovieForTensor(
      movieUnknown,
      aggregatesWithUnk,
    );
    expect(out1.adult).toBe(1);
    expect(out1.original_language_index).toBe(7);

    const aggregatesWithoutUnk = {
      popularityMin: 0.5,
      popularityMax: 1,
      voteAverageMin: 1,
      voteAverageMax: 9,
      languageToIndex: { en: 2 },
    };

    const out2 = service.normalizeMovieForTensor(
      movieUnknown,
      aggregatesWithoutUnk,
    );
    expect(out2.original_language_index).toBe(0);
  });

  it('prioritizes original_language key over __UNK__ when both are present', () => {
    const service = new MovieDataNormalizationService();

    const movie = {
      id: 2,
      original_language: 'pt',
      popularity: 0.5,
      adult: false,
      vote_average: 4,
    } as unknown as Movie;

    const aggregates = {
      popularityMin: 0,
      popularityMax: 1,
      voteAverageMin: 0,
      voteAverageMax: 10,
      languageToIndex: { pt: 9, __UNK__: 3 },
    };

    const out = service.normalizeMovieForTensor(movie, aggregates);
    expect(out.popularity).toBe(0.5);
    expect(out.original_language_index).toBe(9);
  });

  it('handles zero ranges by treating denominator as 1 (no division by zero)', () => {
    const service = new MovieDataNormalizationService();

    const movie = {
      id: 55,
      original_language: 'en',
      popularity: 0.2,
      adult: false,
      vote_average: 3,
    } as unknown as Movie;

    const aggregates = {
      popularityMin: 0.2,
      popularityMax: 0.2,
      voteAverageMin: 3,
      voteAverageMax: 3,
      languageToIndex: { en: 0, __UNK__: 0 },
    };

    const out = service.normalizeMovieForTensor(movie, aggregates);
    expect(out.popularity).toBe(0);
    expect(out.vote_average).toBe(0);
  });
});
