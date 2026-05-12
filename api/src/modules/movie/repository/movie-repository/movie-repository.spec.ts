import { Test, TestingModule } from '@nestjs/testing';
import { MovieRepository } from './movie-repository';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { ListMoviesDto } from '../../dto/list.movies.dto';
import { Movie, Prisma } from '@/generatedprisma/client';
import type {
  MovieCountResult,
  MovieCreateResult,
  MovieFindFirstArgs,
  MovieFindFirstResult,
  MovieFindManyArgs,
  MovieFindManyResult,
  MovieFindUniqueArgs,
  MovieFindUniqueResult,
} from '../../../../../test/movie/movie-repository-test-types';
import { buildMovie } from '../../../../../test/movie/movie-test-utils';

describe('MovieRepository', () => {
  let repository: MovieRepository;
  const prismaService = {
    movie: {
      findMany: jest.fn<MovieFindManyResult, [MovieFindManyArgs]>(),
      findUnique: jest.fn<MovieFindUniqueResult, [MovieFindUniqueArgs]>(),
      create: jest.fn<MovieCreateResult, [Prisma.MovieCreateArgs]>(),
      findFirst: jest.fn<MovieFindFirstResult, [MovieFindFirstArgs]>(),
      count: jest.fn<MovieCountResult, [Prisma.MovieCountArgs]>(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieRepository,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    repository = module.get<MovieRepository>(MovieRepository);
  });

  it('should get all movies', async () => {
    const params = new ListMoviesDto();
    params.page = 1;
    params.per_page = 10;
    params.name = 'A';

    const movieA = buildMovie({ id: 1, title: 'A movie' });

    prismaService.movie.count.mockResolvedValue(1);
    prismaService.movie.findMany.mockResolvedValue([movieA]);

    await expect(repository.getAll(params)).resolves.toMatchObject({
      data: [expect.objectContaining({ id: 1, title: 'A movie' })],
      meta: {
        total: 1,
        lastPage: 1,
        currentPage: 1,
        perPage: 10,
        prev: null,
        next: null,
      },
    });
  });

  it('should find a movie by id', async () => {
    const movieA = buildMovie({ id: 1, title: 'A' });
    prismaService.movie.findUnique.mockResolvedValue(movieA);

    await expect(repository.findById(1)).resolves.toMatchObject({
      id: 1,
      title: 'A',
    });

    expect(prismaService.movie.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should create a movie', async () => {
    const createdMovie = buildMovie({ id: 1, title: 'A' });
    prismaService.movie.create.mockResolvedValue(createdMovie);

    const data: Prisma.MovieCreateInput = {
      title: 'A',
      external_id: 1,
      original_language: 'en',
      overview: 'overview',
      popularity: 1,
      poster_path: null,
      adult: false,
      release_date: new Date('2024-01-01'),
      vote_average: 7.5,
      vote_count: 10,
    };

    await expect(repository.create(data)).resolves.toMatchObject({
      id: 1,
      title: 'A',
    });

    expect(prismaService.movie.create).toHaveBeenCalledWith({
      data,
    });
  });

  it('should find latest release date', async () => {
    const latestRelease = new Date('2024-01-01');
    prismaService.movie.findFirst.mockResolvedValue({
      release_date: latestRelease,
    });

    await expect(repository.findLatestReleaseDate()).resolves.toEqual(
      latestRelease,
    );

    expect(prismaService.movie.findFirst).toHaveBeenCalledWith({
      orderBy: { release_date: 'desc' },
      select: { release_date: true },
    });
  });

  describe('loadMoviesInChunks', () => {
    it('should load a single chunk when remaining movies are fewer than chunkSize', async () => {
      const chunkSize = 3;
      const movies = [
        buildMovie({ id: 1, title: 'M1' }),
        buildMovie({ id: 2, title: 'M2' }),
      ];

      prismaService.movie.findMany.mockResolvedValueOnce(movies);

      const onChunk = jest
        .fn<Promise<void>, [typeof movies]>()
        .mockResolvedValue(undefined as void);

      await expect(
        repository.loadMoviesInChunks(onChunk, chunkSize),
      ).resolves.toBeUndefined();

      expect(prismaService.movie.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.movie.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
        skip: 0,
        take: chunkSize,
      });
      expect(onChunk).toHaveBeenCalledTimes(1);
      expect(onChunk).toHaveBeenCalledWith(movies);
    });

    it('should load multiple chunks and advance skip correctly', async () => {
      const chunkSize = 2;
      const chunk1 = [
        buildMovie({ id: 1, title: 'M1' }),
        buildMovie({ id: 2, title: 'M2' }),
      ];
      const chunk2 = [buildMovie({ id: 3, title: 'M3' })];

      prismaService.movie.findMany
        .mockResolvedValueOnce(chunk1)
        .mockResolvedValueOnce(chunk2);

      const onChunk = jest
        .fn<Promise<void>, [Movie[]]>()
        .mockResolvedValue(undefined as void);

      await expect(
        repository.loadMoviesInChunks(onChunk, chunkSize),
      ).resolves.toBeUndefined();

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

      expect(onChunk).toHaveBeenCalledTimes(2);
      expect(onChunk).toHaveBeenNthCalledWith(1, chunk1);
      expect(onChunk).toHaveBeenNthCalledWith(2, chunk2);
    });

    it('should propagate errors from onChunk', async () => {
      const chunkSize = 2;
      const movies = [buildMovie({ id: 1, title: 'M1' })];

      prismaService.movie.findMany.mockResolvedValueOnce(movies);
      const onChunk = jest.fn().mockRejectedValue(new Error('boom'));

      await expect(
        repository.loadMoviesInChunks(onChunk, chunkSize),
      ).rejects.toThrow('boom');

      expect(onChunk).toHaveBeenCalledTimes(1);
      expect(onChunk).toHaveBeenCalledWith(movies);
    });
  });
});
