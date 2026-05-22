import { Test, TestingModule } from '@nestjs/testing';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { TmdbNeuralService } from './tmdb-neural-service';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import { UserRepository } from '@/modules/user/repository/user-repository';
import { MovieRepository } from '@/modules/movie/repository/movie-repository/movie-repository';
import { MovieDataNormalizationService } from '../services/normalizers/movie-data-normalization.service';
import { UserDataNormalizationService } from '../services/normalizers/user-data-normalization.service';
import { MovieCollectionService } from '../services/collectors/movie-collection.service';
import { UserCollectionService } from '../services/collectors/user-collection.service';
import { NormalizationService } from './services/normalization.service';
import { TrainingDatasetService } from './services/training-dataset.service';
import { ModelTrainingService } from './services/model-training.service';
import { ModelExportService } from './services/model-export.service';
import { MovieEmbeddingService } from './services/movie-embedding.service';
import { NormalizationAggregatesRepository } from '../repository/normalization-aggregates-repository';
import { Neo4jService } from '@/modules/neo4j/neo4j.service';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { Prisma } from '@/generatedprisma/client';
import type { User } from '@/generatedprisma/client';
import type {
  MovieFindManyArgs,
  MovieFindManyResult,
} from '../../../../test/movie/movie-repository-test-types';
import type {
  UserFindManyArgs,
  UserMovieFindManyArgs,
  InteractionFindManyResult,
} from '../../../../test/user/user-repository-test-types';
import { buildMovie } from '../../../../test/movie/movie-test-utils';
import { buildUser } from '../../../../test/user/user-test-utils';

// Modelos pré-treinados com a mesma arquitetura two-tower usada em produção.
// Gerados via script em api/test/neural-computer/fixtures — evita treinar durante o teste,
// o que seria lento e quebraria por incompatibilidade de Float32Array no ambiente Jest.
// process.cwd() em testes Jest aponta para api/ (onde jest é executado).
const FIXTURE_MODEL_PATH = path.resolve(
  process.cwd(),
  'test/neural-computer/fixtures/affinity',
);

function buildAggregates(
  overrides: Partial<{
    age_min: number;
    age_max: number;
    popularity_min: number;
    popularity_max: number;
    vote_average_min: number;
    vote_average_max: number;
    language_to_index: Record<string, number>;
  }> = {},
) {
  return {
    id: 1,
    age_min: 18,
    age_max: 60,
    popularity_min: 0,
    popularity_max: 1000,
    vote_average_min: 0,
    vote_average_max: 10,
    language_to_index: { en: 0, pt: 1 },
    created_at: new Date(),
    ...overrides,
  };
}

describe('TmdbNeuralService', () => {
  let service: TmdbNeuralService;
  let prismaService: {
    movie: {
      findMany: jest.Mock<MovieFindManyResult, [MovieFindManyArgs]>;
      findUnique: jest.Mock;
    };
    user: {
      findMany: jest.Mock<Promise<User[]>, [UserFindManyArgs]>;
      findUnique: jest.Mock;
    };
    userMovie: {
      findMany: jest.Mock<InteractionFindManyResult, [UserMovieFindManyArgs]>;
    };
    normalizationAggregates: {
      findFirst: jest.Mock;
    };
  };
  let neo4jService: {
    upsertMovieEmbedding: jest.Mock<Promise<void>, [number, number[]]>;
    findSimilarMovies: jest.Mock<
      Promise<number[]>,
      [number[], number, number[]]
    >;
  };

  beforeEach(async () => {
    prismaService = {
      movie: {
        findMany: jest
          .fn<MovieFindManyResult, [MovieFindManyArgs]>()
          .mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      user: {
        findMany: jest
          .fn<Promise<User[]>, [UserFindManyArgs]>()
          .mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      userMovie: {
        findMany: jest
          .fn<InteractionFindManyResult, [UserMovieFindManyArgs]>()
          .mockResolvedValue([]),
      },
      normalizationAggregates: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    neo4jService = {
      upsertMovieEmbedding: jest
        .fn<Promise<void>, [number, number[]]>()
        .mockResolvedValue(undefined),
      findSimilarMovies: jest
        .fn<Promise<number[]>, [number[], number, number[]]>()
        .mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbNeuralService,
        TfjsNodeService,
        UserRepository,
        MovieRepository,
        MovieDataNormalizationService,
        UserDataNormalizationService,
        MovieCollectionService,
        UserCollectionService,
        NormalizationService,
        TrainingDatasetService,
        ModelTrainingService,
        ModelExportService,
        MovieEmbeddingService,
        NormalizationAggregatesRepository,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn<string, [string]>(() => FIXTURE_MODEL_PATH),
            get: jest.fn<undefined, [string]>(() => undefined),
          },
        },
        { provide: Neo4jService, useValue: neo4jService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get(TmdbNeuralService);
  });

  it('deve ser instanciado corretamente', () => {
    expect(service).toBeDefined();
  });

  // ── train() ──────────────────────────────────────────────────────────────
  // train() salva modelo no disco — responsabilidade do ModelExportService (testado em seu spec).
  // Aqui verificamos apenas o comportamento observável via prisma: quais queries são feitas
  // e sob quais condições o fluxo avança ou para.

  describe('train()', () => {
    it('não deve lançar erro com banco vazio', async () => {
      await expect(service.train()).resolves.not.toThrow();
    });

    it('deve consultar interações com select de user_id e movie_id', async () => {
      await service.train();

      expect(prismaService.userMovie.findMany).toHaveBeenCalledWith({
        select: { user_id: true, movie_id: true },
      });
    });

    it('deve normalizar filmes com vote_average como Decimal sem lançar erro', async () => {
      const movie = buildMovie({
        id: 10,
        popularity: 50,
        original_language: 'en',
        vote_average: new Prisma.Decimal(8.5),
      });
      const user1 = buildUser({ id: 1 });

      prismaService.movie.findMany
        .mockResolvedValueOnce([
          movie,
          buildMovie({ id: 20, original_language: 'pt' }),
        ])
        .mockResolvedValueOnce([]);
      prismaService.user.findMany
        .mockResolvedValueOnce([user1])
        .mockResolvedValueOnce([]);
      // sem interações válidas → não chega no save → não falha por Decimal
      prismaService.userMovie.findMany.mockResolvedValue([]);

      await expect(service.train()).resolves.not.toThrow();
    });

    it('deve ignorar interações cujo user não foi coletado', async () => {
      const movie1 = buildMovie({ id: 10 });
      const user1 = buildUser({ id: 1 });

      prismaService.movie.findMany
        .mockResolvedValueOnce([movie1])
        .mockResolvedValueOnce([]);
      prismaService.user.findMany
        .mockResolvedValueOnce([user1])
        .mockResolvedValueOnce([]);
      prismaService.userMovie.findMany.mockResolvedValue([
        { user_id: 99, movie_id: 10 },
      ]);

      // user_id: 99 não coletado → dataset vazio → não deve lançar
      await expect(service.train()).resolves.not.toThrow();
    });

    it('deve carregar filmes em chunks e avançar skip corretamente', async () => {
      const chunk1 = Array.from({ length: 200 }, (_, i) =>
        buildMovie({ id: i + 1, original_language: i % 2 === 0 ? 'en' : 'pt' }),
      );
      const chunk2 = [buildMovie({ id: 201, original_language: 'fr' })];

      prismaService.movie.findMany
        .mockResolvedValueOnce(chunk1)
        .mockResolvedValueOnce(chunk2);
      prismaService.user.findMany.mockResolvedValue([]);
      prismaService.userMovie.findMany.mockResolvedValue([]);

      await service.train();

      expect(prismaService.movie.findMany).toHaveBeenCalledTimes(2);
      expect(prismaService.movie.findMany).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ skip: 200, take: 200 }),
      );
    });

    it('deve carregar usuários em chunks e avançar skip corretamente', async () => {
      const chunk1 = Array.from({ length: 200 }, (_, i) =>
        buildUser({ id: i + 1, age: 20 + (i % 40) }),
      );
      const chunk2 = [buildUser({ id: 201, age: 50 })];

      prismaService.movie.findMany.mockResolvedValue([]);
      prismaService.user.findMany
        .mockResolvedValueOnce(chunk1)
        .mockResolvedValueOnce(chunk2);
      prismaService.userMovie.findMany.mockResolvedValue([]);

      await service.train();

      expect(prismaService.user.findMany).toHaveBeenCalledTimes(2);
      expect(prismaService.user.findMany).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ skip: 200, take: 200 }),
      );
    });
  });

  // ── embedMovies() ─────────────────────────────────────────────────────────
  // Usa fixture de modelo pré-treinado em FIXTURE_MODEL_PATH.

  describe('embedMovies()', () => {
    it('não deve chamar upsertMovieEmbedding quando não há filmes', async () => {
      prismaService.movie.findMany.mockResolvedValueOnce([]);

      await service.embedMovies();

      expect(neo4jService.upsertMovieEmbedding).not.toHaveBeenCalled();
    });

    it('deve chamar upsertMovieEmbedding para cada filme com o id correto', async () => {
      const movie1 = buildMovie({ id: 10, original_language: 'en' });
      const movie2 = buildMovie({ id: 20, original_language: 'pt' });

      prismaService.movie.findMany
        .mockResolvedValueOnce([movie1, movie2])
        .mockResolvedValueOnce([]);

      await service.embedMovies();

      expect(neo4jService.upsertMovieEmbedding).toHaveBeenCalledTimes(2);
      expect(neo4jService.upsertMovieEmbedding).toHaveBeenCalledWith(
        10,
        expect.any(Array),
      );
      expect(neo4jService.upsertMovieEmbedding).toHaveBeenCalledWith(
        20,
        expect.any(Array),
      );
    });

    it('deve gerar embedding como array de números para cada filme', async () => {
      const movie1 = buildMovie({ id: 10, original_language: 'en' });

      prismaService.movie.findMany
        .mockResolvedValueOnce([movie1])
        .mockResolvedValueOnce([]);

      await service.embedMovies();

      const [, embedding] = neo4jService.upsertMovieEmbedding.mock.calls[0];
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(32);
      expect(embedding.every((v) => typeof v === 'number')).toBe(true);
    });

    it('deve processar múltiplos chunks de filmes', async () => {
      const chunk1 = Array.from({ length: 200 }, (_, i) =>
        buildMovie({ id: i + 1, original_language: i % 2 === 0 ? 'en' : 'pt' }),
      );
      const chunk2 = [buildMovie({ id: 201, original_language: 'fr' })];

      prismaService.movie.findMany
        .mockResolvedValueOnce(chunk1)
        .mockResolvedValueOnce(chunk2);

      await service.embedMovies();

      expect(neo4jService.upsertMovieEmbedding).toHaveBeenCalledTimes(201);
    });

    it('deve propagar erro quando upsertMovieEmbedding falha', async () => {
      const movie1 = buildMovie({ id: 10, original_language: 'en' });

      prismaService.movie.findMany
        .mockResolvedValueOnce([movie1])
        .mockResolvedValueOnce([]);
      neo4jService.upsertMovieEmbedding.mockRejectedValueOnce(
        new Error('Neo4j connection failed'),
      );

      await expect(service.embedMovies()).rejects.toThrow(
        'Neo4j connection failed',
      );
    });
  });

  // ── recommend() ──────────────────────────────────────────────────────────
  // Usa fixture do user-encoder pré-treinado em FIXTURE_MODEL_PATH para gerar o
  // embedding do usuário via TensorFlow. Prisma e Neo4j são mockados.

  describe('recommend()', () => {
    it('deve lançar NotFoundException quando usuário não existe', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.normalizationAggregates.findFirst.mockResolvedValue(
        buildAggregates(),
      );
      prismaService.userMovie.findMany.mockResolvedValue([]);

      await expect(service.recommend(999)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException quando agregados de normalização não existem', async () => {
      const user = buildUser({ id: 1, age: 30 });
      prismaService.user.findUnique.mockResolvedValue(user);
      prismaService.normalizationAggregates.findFirst.mockResolvedValue(null);
      prismaService.userMovie.findMany.mockResolvedValue([]);

      await expect(service.recommend(1)).rejects.toThrow(NotFoundException);
    });

    it('deve retornar lista vazia quando Neo4j não encontra filmes similares', async () => {
      const user = buildUser({ id: 1, age: 30 });
      prismaService.user.findUnique.mockResolvedValue(user);
      prismaService.normalizationAggregates.findFirst.mockResolvedValue(
        buildAggregates(),
      );
      prismaService.userMovie.findMany.mockResolvedValue([]);
      neo4jService.findSimilarMovies.mockResolvedValue([]);

      const result = await service.recommend(1);

      expect(result).toEqual([]);
    });

    it('deve passar watchedMovieIds corretos para o Neo4j', async () => {
      const user = buildUser({ id: 1, age: 30 });
      prismaService.user.findUnique.mockResolvedValue(user);
      prismaService.normalizationAggregates.findFirst.mockResolvedValue(
        buildAggregates(),
      );
      // getWatchedMovieIdsByUserId usa userMovie.findMany com select movie_id
      prismaService.userMovie.findMany.mockResolvedValue([
        { user_id: 1, movie_id: 10 },
        { user_id: 1, movie_id: 20 },
      ]);
      neo4jService.findSimilarMovies.mockResolvedValue([]);

      await service.recommend(1);

      expect(neo4jService.findSimilarMovies).toHaveBeenCalledWith(
        expect.any(Array),
        5,
        [10, 20],
      );
    });

    it('deve retornar filmes encontrados no Prisma a partir dos IDs do Neo4j', async () => {
      const user = buildUser({ id: 1, age: 30 });
      const movie1 = buildMovie({ id: 100 });
      const movie2 = buildMovie({ id: 200 });

      prismaService.user.findUnique.mockResolvedValue(user);
      prismaService.normalizationAggregates.findFirst.mockResolvedValue(
        buildAggregates(),
      );
      prismaService.userMovie.findMany.mockResolvedValue([]);
      neo4jService.findSimilarMovies.mockResolvedValue([100, 200]);
      prismaService.movie.findUnique
        .mockResolvedValueOnce(movie1)
        .mockResolvedValueOnce(movie2);

      const result = await service.recommend(1);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(100);
      expect(result[1].id).toBe(200);
    });

    it('deve filtrar filmes nulos quando IDs do Neo4j não existem no Prisma', async () => {
      const user = buildUser({ id: 1, age: 30 });
      const movie1 = buildMovie({ id: 100 });

      prismaService.user.findUnique.mockResolvedValue(user);
      prismaService.normalizationAggregates.findFirst.mockResolvedValue(
        buildAggregates(),
      );
      prismaService.userMovie.findMany.mockResolvedValue([]);
      neo4jService.findSimilarMovies.mockResolvedValue([100, 999]);
      // id 100 existe, id 999 foi deletado do Prisma mas ainda existe no Neo4j
      prismaService.movie.findUnique
        .mockResolvedValueOnce(movie1)
        .mockResolvedValueOnce(null);

      const result = await service.recommend(1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(100);
    });

    it('deve gerar embedding via user-encoder do fixture e chamar Neo4j com array de números', async () => {
      const user = buildUser({ id: 1, age: 30 });

      prismaService.user.findUnique.mockResolvedValue(user);
      prismaService.normalizationAggregates.findFirst.mockResolvedValue(
        buildAggregates({ age_min: 18, age_max: 60 }),
      );
      prismaService.userMovie.findMany.mockResolvedValue([]);
      neo4jService.findSimilarMovies.mockResolvedValue([]);

      await service.recommend(1);

      const [embedding] = neo4jService.findSimilarMovies.mock.calls[0];
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBeGreaterThan(0);
      expect(embedding.every((v: unknown) => typeof v === 'number')).toBe(true);
    });

    it('deve normalizar a idade com min-max dos agregados', async () => {
      // age=18, age_min=18, age_max=60 → normalizedAge=0
      // age=60, age_min=18, age_max=60 → normalizedAge=1
      // Verificamos indiretamente que o fluxo não lança com valores extremos.
      for (const age of [18, 60]) {
        jest.clearAllMocks();
        const user = buildUser({ id: 1, age });
        prismaService.user.findUnique.mockResolvedValue(user);
        prismaService.normalizationAggregates.findFirst.mockResolvedValue(
          buildAggregates({ age_min: 18, age_max: 60 }),
        );
        prismaService.userMovie.findMany.mockResolvedValue([]);
        neo4jService.findSimilarMovies.mockResolvedValue([]);

        await expect(service.recommend(1)).resolves.not.toThrow();
      }
    });
  });
});
