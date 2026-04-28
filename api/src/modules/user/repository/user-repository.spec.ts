import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma-service/prisma-service';
import { UserRepository } from './user-repository';
import { ListUserDto } from '../dto/list.user.dto';
import { ListUserMoviesDto } from '../dto/list-user-movies.dto';
import { type User, type Movie } from '@/generatedprisma/client';
import { Prisma } from '@/generatedprisma/client';
import {
  type UserCreateResult,
  type UserCountResult,
  type UserFindManyResult,
  type UserFindUniqueResult,
  type UserMovieCreateResult,
  type UserMovieCountResult,
  type UserMovieDeleteResult,
  type UserMovieFindManyResult,
  type UserMovieFindUniqueResult,
  type MovieFindManyResult,
  type MovieFindUniqueResult,
} from '../../../../test/user/user-test-types';

// types are centralized in `api/test/user/user-test-types`

describe('UserRepository', () => {
  let repository: UserRepository;
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
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  it('should get all users', async () => {
    const user = buildUser();
    const params = new ListUserDto();
    params.page = 1;
    params.per_page = 10;
    params.name = 'Jo';

    prismaService.user.count.mockResolvedValue(1);
    prismaService.user.findMany.mockResolvedValue([
      {
        ...user,
        movies: [
          {
            user_id: 1,
            movie_id: 2,
            movie: buildMovie(),
          },
        ],
      },
    ]);

    await expect(repository.getAll(params)).resolves.toEqual({
      data: [
        {
          ...user,
          latest_movies: [
            {
              ...buildMovie(),
            },
          ],
        },
      ],
      meta: {
        total: 1,
        lastPage: 1,
        currentPage: 1,
        perPage: 10,
        prev: null,
        next: null,
      },
    });

    const expectedFindManyArgs: Prisma.UserFindManyArgs = {
      include: {
        movies: {
          include: { movie: true },
          take: 5,
          orderBy: { movie: { release_date: 'desc' } },
        },
      },
    };

    expect(prismaService.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining(expectedFindManyArgs),
    );
  });

  it('should create a user', async () => {
    prismaService.user.create.mockResolvedValue(buildUser());

    const data: Prisma.UserCreateInput = {
      name: 'John',
      age: 30,
    };

    await expect(repository.create(data)).resolves.toEqual(buildUser());

    expect(prismaService.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: 'John',
          age: 30,
        },
      }),
    );
  });

  it('should create the link when it does not exist', async () => {
    prismaService.user.findUnique.mockResolvedValue(buildUser());
    prismaService.movie.findUnique.mockResolvedValue({ id: 2 });
    prismaService.userMovie.findUnique.mockResolvedValue(null);
    prismaService.userMovie.create.mockResolvedValue({
      user_id: 1,
      movie_id: 2,
      user: buildUser(),
      movie: buildMovie(),
    });

    await expect(repository.addMovieToUser(1, 2)).resolves.toEqual({
      alreadyLinked: false,
      user: buildUser(),
    });

    expect(prismaService.userMovie.findUnique).toHaveBeenCalledWith({
      where: {
        user_id_movie_id: {
          user_id: 1,
          movie_id: 2,
        },
      },
    });
    expect(prismaService.userMovie.create).toHaveBeenCalledWith({
      data: {
        user_id: 1,
        movie_id: 2,
      },
      include: {
        user: true,
        movie: true,
      },
    });
  });

  it('should return success when the link already exists', async () => {
    const user = buildUser();

    prismaService.user.findUnique
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user);
    prismaService.movie.findUnique.mockResolvedValue({ id: 2 });
    prismaService.userMovie.findUnique.mockResolvedValue({
      user_id: 1,
      movie_id: 2,
    });

    await expect(repository.addMovieToUser(1, 2)).resolves.toEqual({
      alreadyLinked: true,
      user: buildUser(),
    });

    expect(prismaService.userMovie.create).not.toHaveBeenCalled();
    expect(prismaService.user.findUnique).toHaveBeenCalledTimes(2);
  });

  it('should remove the link from a user', async () => {
    const user = buildUser();

    prismaService.user.findUnique
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user);

    prismaService.movie.findUnique.mockResolvedValue({ id: 2 });
    prismaService.userMovie.delete.mockResolvedValue({
      user_id: 1,
      movie_id: 2,
    });

    await expect(repository.removeMovieFromUser(1, 2)).resolves.toEqual({
      user_id: 1,
      movie_id: 2,
    });

    expect(prismaService.userMovie.delete).toHaveBeenCalledWith({
      where: {
        user_id_movie_id: {
          user_id: 1,
          movie_id: 2,
        },
      },
    });
  });

  it('should throw not found when user does not exist', async () => {
    prismaService.user.findUnique.mockResolvedValue(null);

    await expect(repository.addMovieToUser(1, 2)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prismaService.movie.findUnique).not.toHaveBeenCalled();
    expect(prismaService.userMovie.create).not.toHaveBeenCalled();
  });

  it('should throw not found when movie does not exist', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'john',
      age: 30,
    });
    prismaService.movie.findUnique.mockResolvedValue(null);

    await expect(repository.removeMovieFromUser(1, 2)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prismaService.userMovie.delete).not.toHaveBeenCalled();
  });

  it('should get movies by user id', async () => {
    const params = new ListUserMoviesDto();
    params.user_id = 1;
    params.page = 1;
    params.per_page = 10;

    prismaService.userMovie.count.mockResolvedValue(1);
    prismaService.userMovie.findMany.mockResolvedValue([
      { movie_id: 2, user_id: 1 },
    ]);
    prismaService.movie.findMany.mockResolvedValue([
      buildMovie({ title: 'Movie' }),
    ]);

    type GetMoviesByUserIdResult = Awaited<
      ReturnType<UserRepository['getMoviesByUserId']>
    >;

    const expectedMoviesByUserId: Pick<
      GetMoviesByUserIdResult,
      'data' | 'meta'
    > = {
      data: expect.arrayContaining([
        expect.objectContaining({ id: 2, title: 'Movie' }),
      ]) as Movie[],
      meta: {
        total: 1,
        lastPage: 1,
        currentPage: 1,
        perPage: 10,
        prev: null,
        next: null,
      },
    };

    await expect(repository.getMoviesByUserId(params)).resolves.toMatchObject(
      expectedMoviesByUserId,
    );

    expect(prismaService.movie.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: [2],
        },
      },
    });
  });
});
