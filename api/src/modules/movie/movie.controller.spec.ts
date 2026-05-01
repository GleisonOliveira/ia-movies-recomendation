import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './service/movie-service/movie-service';
import { MovieRepository } from './repository/movie-repository/movie-repository';
import { ListMoviesDto } from './dto/list.movies.dto';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { buildMovie } from '../../../test/movie/movie-test-utils';
import { Prisma } from '@/generatedprisma/client';
import type { Movie } from '@/generatedprisma/client';
import type {
  MovieFindManyResult,
  MovieCountResult,
} from '../../../test/movie/movie-repository-test-types';

describe('MovieController', () => {
  let controller: MovieController;
  const prismaService = {
    movie: {
      findMany: jest.fn<MovieFindManyResult, [Prisma.MovieFindManyArgs]>(),
      count: jest.fn<MovieCountResult, [Prisma.MovieCountArgs]>(),
    },
  } as const;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        MovieService,
        MovieRepository,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    controller = module.get<MovieController>(MovieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should pass list params to movie service', async () => {
    const params = new ListMoviesDto();
    params.page = 1;
    params.per_page = 10;
    params.name = 'Movie';

    const prismaMovie: Movie = buildMovie({
      title: 'Movie A',
      vote_average: new Prisma.Decimal(8.5),
      id: 1,
    });

    prismaService.movie.count.mockResolvedValue(1);
    prismaService.movie.findMany.mockResolvedValue([prismaMovie]);

    await expect(controller.getAll(params)).resolves.toMatchObject({
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
      },
    });
  });
});
