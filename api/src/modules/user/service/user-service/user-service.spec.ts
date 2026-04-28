import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user-service';
import { UserRepository } from '../../repository/user-repository';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { ListUserDto } from '../../dto/list.user.dto';
import { UserCreateDto } from '../../dto/user.create.dto';
import { AddUserMovieDto } from '../../dto/add-user-movie.dto';
import { ListUserMoviesDto } from '../../dto/list-user-movies.dto';
import { type Movie, type User, Prisma } from '@/generatedprisma/client';
import {
  type MovieFindManyResult,
  type MovieFindUniqueResult,
  type UserCountResult,
  type UserCreateResult,
  type UserFindManyResult,
  type UserFindUniqueResult,
  type UserMovieCountResult,
  type UserMovieCreateResult,
  type UserMovieDeleteResult,
  type UserMovieFindManyResult,
  type UserMovieFindUniqueResult,
} from '../../../../../test/user/user-test-types';

describe('UserService', () => {
  let service: UserService;
  const releaseDate = new Date('2020-01-01T00:00:00.000Z');
  const vote = new Prisma.Decimal(8.1);

  const buildMovie = (overrides: Partial<Movie> = {}): Movie => ({
    id: 2,
    title: 'Movie 1',
    external_id: 1,
    original_language: 'en',
    overview: 'Overview',
    popularity: 1,
    poster_path: null,
    adult: false,
    release_date: releaseDate,
    vote_average: vote,
    vote_count: 1,
    ...overrides,
  });

  const buildUser = (overrides: Partial<User> = {}): User => ({
    id: 1,
    name: 'John',
    age: 30,
    ...overrides,
  });

  const prismaService = {
    user: {
      findMany: jest.fn<UserFindManyResult, [Prisma.UserFindManyArgs]>(),
      findUnique: jest.fn<UserFindUniqueResult, [Prisma.UserFindUniqueArgs]>(),
      create: jest.fn<UserCreateResult, [Prisma.UserCreateArgs]>(),
      count: jest.fn<UserCountResult, [Prisma.UserCountArgs]>(),
    },
    userMovie: {
      findUnique: jest.fn<
        UserMovieFindUniqueResult,
        [Prisma.UserMovieFindUniqueArgs]
      >(),
      create: jest.fn<UserMovieCreateResult, [Prisma.UserMovieCreateArgs]>(),
      delete: jest.fn<UserMovieDeleteResult, [Prisma.UserMovieDeleteArgs]>(),
      findMany: jest.fn<
        UserMovieFindManyResult,
        [Prisma.UserMovieFindManyArgs]
      >(),
      count: jest.fn<UserMovieCountResult, [Prisma.UserMovieCountArgs]>(),
    },
    movie: {
      findUnique: jest.fn<
        MovieFindUniqueResult,
        [Prisma.MovieFindUniqueArgs]
      >(),
      findMany: jest.fn<MovieFindManyResult, [Prisma.MovieFindManyArgs]>(),
    },
  } as const;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserRepository,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get all users', async () => {
    const params = new ListUserDto();
    params.page = 1;
    params.per_page = 10;

    const user = buildUser();
    prismaService.user.count.mockResolvedValue(1);
    prismaService.user.findMany.mockResolvedValue([{ ...user, movies: [] }]);

    await expect(service.getAll(params)).resolves.toEqual({
      data: [{ ...user, latest_movies: [] }],
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

  it('should include latest_movies when listing users with associated movies', async () => {
    const params = new ListUserDto();
    params.page = 1;
    params.per_page = 10;

    const user = buildUser();
    const movie = buildMovie({
      id: 2,
      title: 'Movie 1',
      vote_average: vote.toNumber() as unknown as Prisma.Decimal,
    });
    prismaService.user.count.mockResolvedValue(1);
    prismaService.user.findMany.mockResolvedValue([
      {
        ...user,
        movies: [
          {
            user_id: 1,
            movie_id: 2,
            movie,
          },
        ],
      },
    ]);

    await expect(service.getAll(params)).resolves.toMatchObject({
      data: [
        {
          id: 1,
          latest_movies: [{ id: 2, title: 'Movie 1' }],
        },
      ],
    });
  });

  it('should create a user', async () => {
    const dto = new UserCreateDto();
    dto.name = 'John';
    dto.age = 30;

    const user = buildUser();
    prismaService.user.create.mockResolvedValue({
      ...user,
    });

    await expect(service.create(dto)).resolves.toEqual({
      ...user,
    });
  });

  it('should add a movie to a user', async () => {
    const dto = new AddUserMovieDto();
    dto.user_id = 1;
    dto.movie_id = 2;

    prismaService.user.findUnique.mockResolvedValue(buildUser());
    prismaService.movie.findUnique.mockResolvedValue(buildMovie({ id: 2 }));
    prismaService.userMovie.findUnique.mockResolvedValue(null);
    prismaService.userMovie.create.mockResolvedValue({
      user_id: 1,
      movie_id: 2,
      user: buildUser(),
      movie: buildMovie(),
    });

    await expect(service.addMovieToUser(dto)).resolves.toEqual({
      alreadyLinked: false,
      user: buildUser(),
    });
  });

  it('should remove a movie from a user', async () => {
    const dto = new AddUserMovieDto();
    dto.user_id = 1;
    dto.movie_id = 2;

    prismaService.user.findUnique.mockResolvedValue(buildUser());
    prismaService.movie.findUnique.mockResolvedValue(buildMovie({ id: 2 }));
    prismaService.userMovie.delete.mockResolvedValue({
      user_id: 1,
      movie_id: 2,
    });

    await expect(service.removeMovieFromUser(dto)).resolves.toMatchObject({
      id: undefined,
      name: undefined,
      age: undefined,
    });
  });

  it('should get movies by user id with plainToInstance', async () => {
    const params = new ListUserMoviesDto();
    params.user_id = 1;
    params.page = 1;
    params.per_page = 10;

    prismaService.userMovie.count.mockResolvedValue(1);
    prismaService.userMovie.findMany.mockResolvedValue([
      {
        user_id: 1,
        movie_id: 1,
      },
    ]);
    prismaService.movie.findMany.mockResolvedValue([
      {
        ...buildMovie({ id: 1, title: 'Movie A', vote_average: vote }),
      },
    ]);

    await expect(service.getMoviesByUserId(params)).resolves.toMatchObject({
      data: [
        {
          id: 1,
          title: 'Movie A',
          vote_average: 8.1,
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
});
