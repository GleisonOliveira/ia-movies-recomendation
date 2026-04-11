import { Test, TestingModule } from '@nestjs/testing';
import { MovieRepository } from './movie-repository';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { ListMoviesDto } from '../../dto/list.movies.dto';
import { Prisma } from '@/generatedprisma/client';

describe('MovieRepository', () => {
  let repository: MovieRepository;
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

    prismaService.movie.count.mockResolvedValue(1);
    prismaService.movie.findMany.mockResolvedValue([
      { id: 1, title: 'A movie' },
    ]);

    await expect(repository.getAll(params)).resolves.toEqual({
      data: [{ id: 1, title: 'A movie' }],
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
    prismaService.movie.findUnique.mockResolvedValue({ id: 1, title: 'A' });

    await expect(repository.findById(1)).resolves.toEqual({
      id: 1,
      title: 'A',
    });

    expect(prismaService.movie.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should create a movie', async () => {
    prismaService.movie.create.mockResolvedValue({ id: 1, title: 'A' });

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

    await expect(repository.create(data)).resolves.toEqual({
      id: 1,
      title: 'A',
    });

    expect(prismaService.movie.create).toHaveBeenCalledWith({
      data,
    });
  });

  it('should find latest release date', async () => {
    prismaService.movie.findFirst.mockResolvedValue({
      release_date: new Date('2024-01-01'),
    });

    await expect(repository.findLatestReleaseDate()).resolves.toEqual(
      new Date('2024-01-01'),
    );

    expect(prismaService.movie.findFirst).toHaveBeenCalledWith({
      orderBy: { release_date: 'desc' },
      select: { release_date: true },
    });
  });
});
