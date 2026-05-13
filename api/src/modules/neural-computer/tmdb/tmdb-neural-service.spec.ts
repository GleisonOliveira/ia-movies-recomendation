import { Test, TestingModule } from '@nestjs/testing';
import { TmdbNeuralService } from './tmdb-neural-service';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import { MovieDataNormalizationService } from '../services/normalizers/movie-data-normalization.service';
import { UserDataNormalizationService } from '../services/normalizers/user-data-normalization.service';
import { MovieRepository } from '@/modules/movie/repository/movie-repository/movie-repository';
import { UserRepository } from '@/modules/user/repository/user-repository';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { Prisma } from '@/generatedprisma/client';
import type { Movie } from '@/generatedprisma/client';
import type { User } from '@/generatedprisma/client';
import { mkdir } from 'fs/promises';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
}));

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

// Mock TensorFlow API
const createMockTf = () => ({
  sequential: jest.fn(() => ({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn().mockResolvedValue(undefined),
    save: jest.fn().mockResolvedValue(undefined),
  })),
  tensor2d: jest.fn((data: number[][]) => ({
    data,
    shape: [data.length, data[0]?.length || 0],
    dispose: jest.fn(),
  })),
  layers: {
    dense: jest.fn((config: Record<string, unknown>) => config),
  },
  train: {
    adam: jest.fn(() => ({})),
  },
  tidy: jest.fn((fn: unknown) => fn),
});

describe('TmdbNeuralService', () => {
  let service: TmdbNeuralService;
  let prismaService: PrismaService;
  let mockTf: ReturnType<typeof createMockTf>;

  beforeEach(async () => {
    mockTf = createMockTf();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbNeuralService,
        MovieRepository,
        UserRepository,
        {
          provide: TfjsNodeService,
          useValue: {
            tf: mockTf,
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
            userMovie: {
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
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

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
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

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
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

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
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

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
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

      await service.train();

      expect(
        (prismaService.user.findMany as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
    });

    it('should handle empty movies and users arrays', async () => {
      (prismaService.movie.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

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
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

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
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

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
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

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
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

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
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

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
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

      await service.train();

      expect(
        (prismaService.user.findMany as jest.Mock).mock.calls.length,
      ).toBeGreaterThan(0);
    });

    it('should load interactions and build training dataset', async () => {
      const user1 = buildUser({ id: 1, age: 25 });
      const user2 = buildUser({ id: 2, age: 30 });
      const movie1 = buildMovie({
        id: 10,
        popularity: 50,
        vote_average: new Prisma.Decimal(7.5),
        original_language: 'en',
      });
      const movie2 = buildMovie({
        id: 20,
        popularity: 80,
        vote_average: new Prisma.Decimal(8.0),
        original_language: 'pt',
      });

      // Normalization phase: provide same data for both aggregate and normalization passes
      (prismaService.movie.findMany as jest.Mock)
        .mockResolvedValueOnce([movie1, movie2]) // aggregate pass
        .mockResolvedValueOnce([movie1, movie2]) // normalization pass
        .mockResolvedValueOnce([]);
      (prismaService.user.findMany as jest.Mock)
        .mockResolvedValueOnce([user1, user2]) // aggregate
        .mockResolvedValueOnce([user1, user2]) // normalization
        .mockResolvedValueOnce([]);
      // Interactions
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([
        { user_id: 1, movie_id: 10 },
        { user_id: 2, movie_id: 20 },
      ]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

      await service.train();

      expect(prismaService.userMovie.findMany).toHaveBeenCalledWith({
        select: { user_id: true, movie_id: true },
      });
      expect(mockTf.sequential).toHaveBeenCalled();
      expect(mockTf.tensor2d).toHaveBeenCalled();
      // Model should be compiled and fit
      const mockModel = (mockTf.sequential as jest.Mock).mock.results[0].value;
      expect(mockModel.add).toHaveBeenCalled();
      expect(mockModel.compile).toHaveBeenCalled();
      expect(mockModel.fit).toHaveBeenCalled();
      expect(mockModel.save).toHaveBeenCalled();
    });

    it('should generate negative samples during dataset building', async () => {
      const user1 = buildUser({ id: 1, age: 25 });
      const movie1 = buildMovie({
        id: 10,
        popularity: 50,
        vote_average: new Prisma.Decimal(7.5),
        original_language: 'en',
      });
      const movie2 = buildMovie({
        id: 20,
        popularity: 80,
        vote_average: new Prisma.Decimal(8.0),
        original_language: 'pt',
      });

      (prismaService.movie.findMany as jest.Mock)
        .mockResolvedValueOnce([movie1, movie2]) // aggregate
        .mockResolvedValueOnce([movie1, movie2]) // normalization
        .mockResolvedValueOnce([]);
      (prismaService.user.findMany as jest.Mock)
        .mockResolvedValueOnce([user1]) // aggregate
        .mockResolvedValueOnce([user1]) // normalization
        .mockResolvedValueOnce([]);
      // Interaction: user1 watched movie1, negative will be movie2
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([
        { user_id: 1, movie_id: 10 },
      ]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

      await service.train();

      // Should have created tensors with positive + negative = 2 examples
      // tf.tensor2d is called twice: once for features, once for labels
      expect(mockTf.tensor2d).toHaveBeenCalledTimes(2);
      // The first call (features) should contain 2 feature vectors
      const featuresTensorCall = (mockTf.tensor2d as jest.Mock).mock.calls[0];
      const featureVectors = featuresTensorCall[0] as number[][];
      expect(featureVectors.length).toBe(2);
    });

    it('should save model after training', async () => {
      const user = buildUser({ id: 1, age: 25 });
      const movie = buildMovie({
        id: 10,
        popularity: 50,
        vote_average: new Prisma.Decimal(7.5),
        original_language: 'en',
      });

      (prismaService.movie.findMany as jest.Mock)
        .mockResolvedValueOnce([movie])
        .mockResolvedValueOnce([]);
      (prismaService.user.findMany as jest.Mock)
        .mockResolvedValueOnce([user])
        .mockResolvedValueOnce([]);
      (prismaService.userMovie.findMany as jest.Mock).mockResolvedValue([
        { user_id: 1, movie_id: 10 },
      ]);
      (mkdir as jest.Mock).mockResolvedValue(undefined);

      await service.train();

      const mockModel = mockTf.sequential();
      expect(mockModel.save).toHaveBeenCalledWith(
        `file://${expect.stringContaining('models/affinity')}`,
      );
    });
  });
});
