import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MovieCollectionService } from './movie-collection.service';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { MovieDataNormalizationService } from '../normalizers/movie-data-normalization.service';
import { MovieRepository } from '@/modules/movie/repository/movie-repository/movie-repository';
import { Prisma } from '@/generatedprisma/client';
import type { Movie } from '@/generatedprisma/client';
import type {
  MovieFindManyArgs,
  MovieFindManyResult,
} from '../../../../../test/movie/movie-repository-test-types';
import { buildMovie } from '../../../../../test/movie/movie-test-utils';

describe('MovieCollectionService', () => {
  let service: MovieCollectionService;
  const prismaService = {
    movie: {
      findMany: jest.fn<MovieFindManyResult, [MovieFindManyArgs]>(),
    },
  };
  const configService: { get: jest.Mock } = {
    get: jest.fn(),
  };

  const testMovies: Movie[] = [
    buildMovie({
      id: 1,
      title: 'Movie 1',
      original_language: 'en',
      popularity: 0.5,
      vote_average: new Prisma.Decimal(8.0),
    }),
    buildMovie({
      id: 2,
      title: 'Movie 2',
      original_language: 'es',
      popularity: 0.8,
      vote_average: new Prisma.Decimal(6.0),
    }),
    buildMovie({
      id: 3,
      title: 'Movie 3',
      original_language: 'en',
      popularity: 0.3,
      vote_average: new Prisma.Decimal(9.0),
    }),
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    configService.get.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieCollectionService,
        MovieDataNormalizationService,
        MovieRepository,
        { provide: PrismaService, useValue: prismaService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<MovieCollectionService>(MovieCollectionService);
  });

  describe('collectAndFitMovies', () => {
    it('should collect movies in a single chunk and compute correct aggregates', async () => {
      prismaService.movie.findMany.mockResolvedValueOnce(testMovies);

      const result = await service.collectAndFitMovies();

      expect(prismaService.movie.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
        skip: 0,
        take: 200,
      });

      expect(result.movies).toEqual(testMovies);
      expect(result).toHaveProperty('movies');
      expect(result).toHaveProperty('aggregates');
      expect(Array.isArray(result.movies)).toBe(true);

      const expectedAggregates = {
        popularityMin: 0.3,
        popularityMax: 0.8,
        voteAverageMin: 6.0,
        voteAverageMax: 9.0,
        languageToIndex: { en: 0, es: 1 },
      };

      expect(result.aggregates).toEqual(expectedAggregates);
    });

    it('should call Prisma in chunks using config chunkSize', async () => {
      const chunkSize = 2;
      configService.get.mockReturnValue(chunkSize);

      const moviesChunk1 = [
        buildMovie({
          id: 1,
          title: 'Movie 1',
          original_language: 'en',
          popularity: 0.5,
          vote_average: new Prisma.Decimal(7.0),
        }),
        buildMovie({
          id: 2,
          title: 'Movie 2',
          original_language: 'es',
          popularity: 0.8,
          vote_average: new Prisma.Decimal(6.0),
        }),
      ];
      const moviesChunk2 = [
        buildMovie({
          id: 3,
          title: 'Movie 3',
          original_language: 'fr',
          popularity: 0.9,
          vote_average: new Prisma.Decimal(8.5),
        }),
      ];

      prismaService.movie.findMany
        .mockResolvedValueOnce(moviesChunk1)
        .mockResolvedValueOnce(moviesChunk2);

      const result = await service.collectAndFitMovies();

      expect(prismaService.movie.findMany).toHaveBeenCalledTimes(2);
      expect(prismaService.movie.findMany).toHaveBeenNthCalledWith(1, {
        orderBy: { id: 'asc' },
        skip: 0,
        take: chunkSize,
      });
      expect(prismaService.movie.findMany).toHaveBeenNthCalledWith(2, {
        orderBy: { id: 'asc' },
        skip: chunkSize,
        take: chunkSize,
      });

      expect(result.movies).toEqual([...moviesChunk1, ...moviesChunk2]);
      expect(result.aggregates.languageToIndex).toEqual({
        en: 0,
        es: 1,
        fr: 2,
      });
      expect(result.aggregates.popularityMin).toBe(0.5);
      expect(result.aggregates.popularityMax).toBe(0.9);
    });

    it('should use default chunkSize when config returns undefined', async () => {
      configService.get.mockReturnValue(undefined);

      prismaService.movie.findMany.mockResolvedValueOnce(testMovies);

      await service.collectAndFitMovies();

      expect(prismaService.movie.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
        skip: 0,
        take: 200,
      });
    });
  });
});
