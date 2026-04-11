import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie-service';
import { MovieRepository } from '../../repository/movie-repository/movie-repository';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { MovieCreateDto } from '../../dto/movie.create.dto';
import { ListMoviesDto } from '../../dto/list.movies.dto';

describe('MovieService', () => {
  let service: MovieService;
  const prismaService = {
    movie: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
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
    expect(service).toBeDefined();
  });

  it('should get all movies with plainToInstance', async () => {
    const params = new ListMoviesDto();
    params.page = 1;
    params.per_page = 10;
    params.name = 'Movie';

    prismaService.movie.count.mockResolvedValue(1);
    prismaService.movie.findMany.mockResolvedValue([
      {
        id: 1,
        title: 'Movie A',
        vote_average: { toNumber: () => 8.5 },
      },
    ]);

    await expect(service.getAll(params)).resolves.toEqual({
      data: [
        {
          id: 1,
          title: 'Movie A',
          vote_average: 8.5,
        },
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
      id: 1,
      title: 'Movie A',
      vote_average: { toNumber: () => 7.2 },
    });

    await expect(service.getById(1)).resolves.toEqual({
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
      id: 1,
      title: 'Movie A',
      vote_average: { toNumber: () => 7.8 },
    });

    await expect(service.createMovie(dto)).resolves.toEqual({
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
