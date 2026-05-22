import { Test, TestingModule } from '@nestjs/testing';
import { NormalizationService } from './normalization.service';
import { MovieDataNormalizationService } from '../../services/normalizers/movie-data-normalization.service';
import { UserDataNormalizationService } from '../../services/normalizers/user-data-normalization.service';
import { buildMovie } from '../../../../../test/movie/movie-test-utils';
import { buildUser } from '../../../../../test/user/user-test-utils';
import type {
  MovieFeatureAggregates,
  UserFeatureAggregates,
} from '../../services/types';

describe('NormalizationService', () => {
  let service: NormalizationService;

  const defaultMovieAgg: MovieFeatureAggregates = {
    popularityMin: 0,
    popularityMax: 100,
    voteAverageMin: 0,
    voteAverageMax: 10,
    languageToIndex: { en: 0, pt: 1 },
  };

  const defaultUserAgg: UserFeatureAggregates = {
    ageMin: 18,
    ageMax: 60,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NormalizationService,
        MovieDataNormalizationService,
        UserDataNormalizationService,
      ],
    }).compile();

    service = module.get(NormalizationService);
  });

  it('deve ser instanciado corretamente', () => {
    expect(service).toBeDefined();
  });

  describe('normalizeMoviesFromMemory()', () => {
    it('deve retornar Map vazio quando lista de filmes é vazia', () => {
      const result = service.normalizeMoviesFromMemory([], defaultMovieAgg);
      expect(result.size).toBe(0);
    });

    it('deve indexar filmes pelo id', () => {
      const movie1 = buildMovie({ id: 10 });
      const movie2 = buildMovie({ id: 20, original_language: 'pt' });

      const result = service.normalizeMoviesFromMemory(
        [movie1, movie2],
        defaultMovieAgg,
      );

      expect(result.has(10)).toBe(true);
      expect(result.has(20)).toBe(true);
    });

    it('deve normalizar popularity para [0, 1]', () => {
      const movie = buildMovie({ id: 1, popularity: 50 });

      const result = service.normalizeMoviesFromMemory(
        [movie],
        defaultMovieAgg,
      );
      const features = result.get(1)!;

      expect(features.popularity).toBeCloseTo(0.5);
    });

    it('deve converter adult=true para 1', () => {
      const movie = buildMovie({ id: 1, adult: true });

      const result = service.normalizeMoviesFromMemory(
        [movie],
        defaultMovieAgg,
      );

      expect(result.get(1)!.adult).toBe(1);
    });

    it('deve converter adult=false para 0', () => {
      const movie = buildMovie({ id: 1, adult: false });

      const result = service.normalizeMoviesFromMemory(
        [movie],
        defaultMovieAgg,
      );

      expect(result.get(1)!.adult).toBe(0);
    });

    it('deve mapear original_language_index conforme languageToIndex', () => {
      const movie = buildMovie({ id: 1, original_language: 'pt' });

      const result = service.normalizeMoviesFromMemory(
        [movie],
        defaultMovieAgg,
      );

      expect(result.get(1)!.original_language_index).toBe(1);
    });

    it('deve retornar 0 para idioma desconhecido', () => {
      const movie = buildMovie({ id: 1, original_language: 'ja' });

      const result = service.normalizeMoviesFromMemory(
        [movie],
        defaultMovieAgg,
      );

      expect(result.get(1)!.original_language_index).toBe(0);
    });
  });

  describe('normalizeUsersFromMemory()', () => {
    it('deve retornar Map vazio quando lista de usuários é vazia', () => {
      const result = service.normalizeUsersFromMemory([], defaultUserAgg);
      expect(result.size).toBe(0);
    });

    it('deve indexar usuários pelo id', () => {
      const user1 = buildUser({ id: 1 });
      const user2 = buildUser({ id: 2, age: 40 });

      const result = service.normalizeUsersFromMemory(
        [user1, user2],
        defaultUserAgg,
      );

      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(true);
    });

    it('deve normalizar age para [0, 1]', () => {
      // ageMin=18, ageMax=60, age=39 → (39-18)/(60-18) = 0.5
      const user = buildUser({ id: 1, age: 39 });

      const result = service.normalizeUsersFromMemory([user], defaultUserAgg);

      expect(result.get(1)!.age).toBeCloseTo(0.5);
    });

    it('deve retornar age=0 quando ageMin === ageMax', () => {
      const agg: UserFeatureAggregates = { ageMin: 30, ageMax: 30 };
      const user = buildUser({ id: 1, age: 30 });

      const result = service.normalizeUsersFromMemory([user], agg);

      expect(result.get(1)!.age).toBe(0);
    });
  });
});
