import { Test, TestingModule } from '@nestjs/testing';
import * as path from 'path';
import { MovieEmbeddingService } from './movie-embedding.service';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import { MovieCollectionService } from '../../services/collectors/movie-collection.service';
import { MovieDataNormalizationService } from '../../services/normalizers/movie-data-normalization.service';
import { MovieRepository } from '@/modules/movie/repository/movie-repository/movie-repository';
import { Neo4jService } from '@/modules/neo4j/neo4j.service';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { ConfigService } from '@nestjs/config';
import type {
  MovieFindManyArgs,
  MovieFindManyResult,
} from '../../../../../test/movie/movie-repository-test-types';
import { buildMovie } from '../../../../../test/movie/movie-test-utils';

const FIXTURE_MODEL_PATH = path.resolve(
  process.cwd(),
  'test/neural-computer/fixtures/affinity',
);

describe('MovieEmbeddingService', () => {
  let service: MovieEmbeddingService;
  let prismaService: {
    movie: { findMany: jest.Mock<MovieFindManyResult, [MovieFindManyArgs]> };
  };
  let neo4jService: {
    upsertMovieEmbedding: jest.Mock<Promise<void>, [number, number[]]>;
  };

  beforeEach(async () => {
    prismaService = {
      movie: {
        findMany: jest
          .fn<MovieFindManyResult, [MovieFindManyArgs]>()
          .mockResolvedValue([]),
      },
    };
    neo4jService = {
      upsertMovieEmbedding: jest
        .fn<Promise<void>, [number, number[]]>()
        .mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieEmbeddingService,
        TfjsNodeService,
        MovieRepository,
        MovieDataNormalizationService,
        MovieCollectionService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn<undefined, [string]>(() => undefined) },
        },
        { provide: Neo4jService, useValue: neo4jService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get(MovieEmbeddingService);
  });

  it('deve ser instanciado corretamente', () => {
    expect(service).toBeDefined();
  });

  it('não deve chamar upsertMovieEmbedding quando não há filmes', async () => {
    prismaService.movie.findMany.mockResolvedValueOnce([]);

    await service.embedMovies(FIXTURE_MODEL_PATH);

    expect(neo4jService.upsertMovieEmbedding).not.toHaveBeenCalled();
  });

  it('deve chamar upsertMovieEmbedding para cada filme com o id correto', async () => {
    const movie1 = buildMovie({ id: 10, original_language: 'en' });
    const movie2 = buildMovie({ id: 20, original_language: 'pt' });

    prismaService.movie.findMany
      .mockResolvedValueOnce([movie1, movie2])
      .mockResolvedValueOnce([]);

    await service.embedMovies(FIXTURE_MODEL_PATH);

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

  it('deve gerar embedding como array de 32 números para cada filme', async () => {
    const movie = buildMovie({ id: 10, original_language: 'en' });

    prismaService.movie.findMany
      .mockResolvedValueOnce([movie])
      .mockResolvedValueOnce([]);

    await service.embedMovies(FIXTURE_MODEL_PATH);

    const [, embedding] = neo4jService.upsertMovieEmbedding.mock.calls[0];
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding).toHaveLength(32);
    expect(embedding.every((v) => typeof v === 'number')).toBe(true);
  });

  it('deve propagar erro quando upsertMovieEmbedding falha', async () => {
    const movie = buildMovie({ id: 10, original_language: 'en' });

    prismaService.movie.findMany
      .mockResolvedValueOnce([movie])
      .mockResolvedValueOnce([]);
    neo4jService.upsertMovieEmbedding.mockRejectedValueOnce(
      new Error('Neo4j connection failed'),
    );

    await expect(service.embedMovies(FIXTURE_MODEL_PATH)).rejects.toThrow(
      'Neo4j connection failed',
    );
  });

  describe('carregamento em chunks', () => {
    it('deve processar chunk único quando há menos filmes que o chunkSize', async () => {
      const chunk = [
        buildMovie({ id: 10, original_language: 'en' }),
        buildMovie({ id: 20, original_language: 'pt' }),
      ];

      prismaService.movie.findMany.mockResolvedValueOnce(chunk);

      await service.embedMovies(FIXTURE_MODEL_PATH);

      expect(prismaService.movie.findMany).toHaveBeenCalledTimes(1);
      expect(neo4jService.upsertMovieEmbedding).toHaveBeenCalledTimes(2);
    });

    it('deve avançar skip corretamente ao processar múltiplos chunks', async () => {
      const chunk1 = Array.from({ length: 200 }, (_, i) =>
        buildMovie({ id: i + 1, original_language: i % 2 === 0 ? 'en' : 'pt' }),
      );
      const chunk2 = [buildMovie({ id: 201, original_language: 'fr' })];

      prismaService.movie.findMany
        .mockResolvedValueOnce(chunk1)
        .mockResolvedValueOnce(chunk2);

      await service.embedMovies(FIXTURE_MODEL_PATH);

      expect(prismaService.movie.findMany).toHaveBeenCalledTimes(2);
      expect(prismaService.movie.findMany).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ skip: 200, take: 200 }),
      );
      expect(neo4jService.upsertMovieEmbedding).toHaveBeenCalledTimes(201);
    });

    it('deve parar de carregar quando chunk retorna menos que chunkSize', async () => {
      prismaService.movie.findMany.mockResolvedValueOnce([
        buildMovie({ id: 1, original_language: 'en' }),
        buildMovie({ id: 2, original_language: 'pt' }),
      ]);

      await service.embedMovies(FIXTURE_MODEL_PATH);

      expect(prismaService.movie.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
