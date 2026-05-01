import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie-service';
import { MovieRepository } from '../../repository/movie-repository/movie-repository';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { MovieCreateDto } from '../../dto/movie.create.dto';
import { ListMoviesDto } from '../../dto/list.movies.dto';
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
import { buildUser } from '../../../../../test/user/user-test-utils';
import { Prisma } from '@/generatedprisma/client';

describe('MovieService', () => {
  let service: MovieService;
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
        MovieService,
        MovieRepository,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
  });

  it('should be defined', () => {
    const user = buildUser();
    expect(user.id).toBe(1);
    expect(service).toBeDefined();
  });

  it('should get all movies with plainToInstance', async () => {
    const params = new ListMoviesDto();
    params.page = 1;
    params.per_page = 10;
    params.name = 'Movie';

    prismaService.movie.count.mockResolvedValue(1);
    prismaService.movie.findMany.mockResolvedValue([
      buildMovie({
        id: 1,
        title: 'Movie A',
        vote_average: new Prisma.Decimal(8.5),
      }),
    ]);

    await expect(service.getAll(params)).resolves.toMatchObject({
      data: [
        expect.objectContaining({
          id: 1,
          title: 'Movie A',
          vote_average: 8.5,
        }),
      ],
      meta: {
        total: 1,
        last_page: 1,
        current_page: 1,
        per_page: 10,
        prev: null,
        next: null,
      },
    });
  });

  it('should get a movie by id with plainToInstance', async () => {
    prismaService.movie.findUnique.mockResolvedValue({
      ...buildMovie({
        id: 1,
        title: 'Movie A',
        vote_average: new Prisma.Decimal(7.2),
      }),
    });

    await expect(service.getById(1)).resolves.toMatchObject({
      id: 1,
      title: 'Movie A',
      vote_average: 7.2,
    });
  });

  it('should create a movie with plainToInstance', async () => {
    const dto = new MovieCreateDto(
      'Movie A',
      123,
      'en',
      'Overview',
      9.1,
      null,
      false,
      new Date('2024-01-01'),
      7.8,
      100,
    );

    prismaService.movie.create.mockResolvedValue({
      ...buildMovie({
        id: 1,
        title: 'Movie A',
        vote_average: new Prisma.Decimal(7.8),
      }),
    });

    await expect(service.createMovie(dto)).resolves.toMatchObject({
      id: 1,
      title: 'Movie A',
      vote_average: 7.8,
    });
  });

  it('should get latest release date', async () => {
    const latestReleaseDate = new Date('2024-01-01');
    prismaService.movie.findFirst.mockResolvedValue({
      release_date: latestReleaseDate,
    });

    await expect(service.getLatestReleaseDate()).resolves.toBe(
      latestReleaseDate,
    );
  });
});
