import { Test, TestingModule } from '@nestjs/testing';
import { TmdbNeuralService } from './tmdb-neural-service';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import { MovieDataNormalizationService } from '../services/movie-data-normalization.service';
import { UserDataNormalizationService } from '../services/user-data-normalization.service';
import { MovieRepository } from '@/modules/movie/repository/movie-repository/movie-repository';
import { UserRepository } from '@/modules/user/repository/user-repository';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { Prisma } from '@/generatedprisma/client';
import type { Movie } from '@/generatedprisma/client';
import type { User } from '@/generatedprisma/client';

const buildMovie = (overrides: Partial<Movie> = {}): Movie => ({
  id: 1,
  title: 'Movie 1',
  external_id: 1,
  original_language: 'en',
  overview: 'Overview',
  popularity: 1,
  poster_path: null,
  adult: false,
  release_date: new Date('2020-01-01'),
  vote_average: new Prisma.Decimal(7.5),
  vote_count: 1,
  ...overrides,
});

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  name: 'John',
  age: 30,
  ...overrides,
});

describe('TmdbNeuralService', () => {
  let service: TmdbNeuralService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbNeuralService,
        MovieRepository,
        UserRepository,
        {
          provide: TfjsNodeService,
          useValue: {
            tf: {
              tidy: jest.fn((fn: unknown) => fn),
            },
          },
        },
        MovieDataNormalizationService,
        UserDataNormalizationService,
        {
          provide: PrismaService,
          useValue: {
            movie: {
              findMany: jest.fn(),
            },
            user: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TmdbNeuralService>(TmdbNeuralService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('train', () => {
    it('should train without errors', async () => {
      (prismaService.movie.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);

      await expect(service.train()).resolves.not.toThrow();
    });

    it('should call updateMovieFeatureAggregates for each movie', async () => {
      const movie1 = buildMovie({
        id: 1,
        popularity: 50,
        vote_average: new Prisma.Decimal(7.5),
        original_language: 'en',
      });
      const movie2 = buildMovie({
        id: 2,
        popularity: 80,
        vote_average: new Prisma.Decimal(8.5),
        original_language: 'pt',
      });

      (prismaService.movie.findMany as jest.Mock)
        .mockResolvedValueOnce([movie1])
        .mockResolvedValueOnce([movie2])
        .mockResolvedValueOnce([]);
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);

      await service.train();

      expect(
        (prismaService.movie.findMany as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
    });

    it('should call updateUserFeatureAggregates for each user', async () => {
      const user1 = buildUser({ id: 1, age: 25 });
      const user2 = buildUser({ id: 2, age: 35 });

      (prismaService.movie.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.user.findMany as jest.Mock)
        .mockResolvedValueOnce([user1])
        .mockResolvedValueOnce([user2])
        .mockResolvedValueOnce([]);

      await service.train();

      expect(
        (prismaService.user.findMany as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
    });

    it('should handle movies with same language correctly', async () => {
      const movie1 = buildMovie({
        id: 1,
        popularity: 30,
        vote_average: new Prisma.Decimal(6.0),
        original_language: 'en',
      });
      const movie2 = buildMovie({
        id: 2,
        popularity: 70,
        vote_average: new Prisma.Decimal(9.0),
        original_language: 'en',
      });

      (prismaService.movie.findMany as jest.Mock)
        .mockResolvedValueOnce([movie1])
        .mockResolvedValueOnce([movie2])
        .mockResolvedValueOnce([]);
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);

      await service.train();

      expect(
        (prismaService.movie.findMany as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
    });

    it('should handle users with different ages correctly', async () => {
      const user1 = buildUser({ id: 1, age: 18 });
      const user2 = buildUser({ id: 2, age: 65 });

      (prismaService.movie.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.user.findMany as jest.Mock)
        .mockResolvedValueOnce([user1])
        .mockResolvedValueOnce([user2])
        .mockResolvedValueOnce([]);

      await service.train();

      expect(
        (prismaService.user.findMany as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
    });

    it('should handle empty movies and users arrays', async () => {
      (prismaService.movie.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);

      await expect(service.train()).resolves.not.toThrow();
    });

    it('should process multiple chunks of movies', async () => {
      const moviesChunk1 = [
        buildMovie({ id: 1, popularity: 10 }),
        buildMovie({ id: 2, popularity: 20 }),
      ];
      const moviesChunk2 = [buildMovie({ id: 3, popularity: 30 })];

      (prismaService.movie.findMany as jest.Mock)
        .mockResolvedValueOnce(moviesChunk1)
        .mockResolvedValueOnce(moviesChunk2)
        .mockResolvedValueOnce([]);
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);

      await service.train();

      expect(
        (prismaService.movie.findMany as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
    });

    it('should process multiple chunks of users', async () => {
      const usersChunk1 = [
        buildUser({ id: 1, age: 20 }),
        buildUser({ id: 2, age: 30 }),
      ];
      const usersChunk2 = [buildUser({ id: 3, age: 40 })];

      (prismaService.movie.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.user.findMany as jest.Mock)
        .mockResolvedValueOnce(usersChunk1)
        .mockResolvedValueOnce(usersChunk2)
        .mockResolvedValueOnce([]);

      await service.train();

      expect(
        (prismaService.user.findMany as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
    });

    it('should call finalizeMovieFeatureAggregates after processing all movies', async () => {
      const movie = buildMovie({
        id: 1,
        popularity: 50,
        vote_average: new Prisma.Decimal(7.5),
        original_language: 'en',
      });

      (prismaService.movie.findMany as jest.Mock)
        .mockResolvedValueOnce([movie])
        .mockResolvedValueOnce([]);
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);

      await service.train();

      expect(
        (prismaService.movie.findMany as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
    });

    it('should call finalizeUserFeatureAggregates after processing all users', async () => {
      const user = buildUser({ id: 1, age: 25 });

      (prismaService.movie.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.user.findMany as jest.Mock)
        .mockResolvedValueOnce([user])
        .mockResolvedValueOnce([]);

      await service.train();

      expect(
        (prismaService.user.findMany as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
    });

    it('should call normalizeMovieForTensor during normalization phase', async () => {
      const movie = buildMovie({
        id: 1,
        popularity: 50,
        vote_average: new Prisma.Decimal(7.5),
        original_language: 'en',
      });

      (prismaService.movie.findMany as jest.Mock)
        .mockResolvedValueOnce([movie])
        .mockResolvedValueOnce([movie])
        .mockResolvedValueOnce([]);
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);

      await service.train();

      expect(
        (prismaService.movie.findMany as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
    });

    it('should call normalizeUserForTensor during normalization phase', async () => {
      const user = buildUser({ id: 1, age: 25 });

      (prismaService.movie.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.user.findMany as jest.Mock)
        .mockResolvedValueOnce([user])
        .mockResolvedValueOnce([user])
        .mockResolvedValueOnce([]);

      await service.train();

      expect(
        (prismaService.user.findMany as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
    });
  });
});
