import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma-service/prisma-service';
import { UserRepository } from './user-repository';
import { ListUserDto } from '../dto/list.user.dto';
import { ListUserMoviesDto } from '../dto/list-user-movies.dto';
import { type Movie, type User } from '@/generatedprisma/client';
import { Prisma } from '@/generatedprisma/client';
import { buildMovie } from '../../../../test/movie/movie-test-utils';
import { buildUser } from '../../../../test/user/user-test-utils';
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
} from '../../../../test/user/user-repository-test-types';

describe('UserRepository', () => {
  let repository: UserRepository;

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

  describe('loadUsersInChunks', () => {
    it('should load all users in a single chunk when users count is less than chunkSize', async () => {
      const users = [
        { ...buildUser({ id: 1 }), movies: [] },
        { ...buildUser({ id: 2 }), movies: [] },
      ];
      prismaService.user.findMany.mockResolvedValue(users);

      const chunks: User[][] = [];
      await repository.loadUsersInChunks(async (chunk) => {
        chunks.push(chunk);

        await Promise.resolve();
      }, 10);

      expect(chunks).toEqual([users]);
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
        skip: 0,
        take: 10,
      });
    });

    it('should load users in multiple chunks when users count exceeds chunkSize', async () => {
      const users1 = [
        { ...buildUser({ id: 1 }), movies: [] },
        { ...buildUser({ id: 2 }), movies: [] },
      ];
      const users2 = [
        { ...buildUser({ id: 3 }), movies: [] },
        { ...buildUser({ id: 4 }), movies: [] },
      ];
      const users3 = [{ ...buildUser({ id: 5 }), movies: [] }];

      prismaService.user.findMany
        .mockResolvedValueOnce(users1)
        .mockResolvedValueOnce(users2)
        .mockResolvedValueOnce(users3);

      const chunks: User[][] = [];
      await repository.loadUsersInChunks(async (chunk) => {
        chunks.push(chunk);

        await Promise.resolve();
      }, 2);

      expect(chunks).toEqual([users1, users2, users3]);
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(3);
      expect(prismaService.user.findMany).toHaveBeenNthCalledWith(1, {
        orderBy: { id: 'asc' },
        skip: 0,
        take: 2,
      });
      expect(prismaService.user.findMany).toHaveBeenNthCalledWith(2, {
        orderBy: { id: 'asc' },
        skip: 2,
        take: 2,
      });
      expect(prismaService.user.findMany).toHaveBeenNthCalledWith(3, {
        orderBy: { id: 'asc' },
        skip: 4,
        take: 2,
      });
    });

    it('should not call onChunk when no users exist', async () => {
      prismaService.user.findMany.mockResolvedValue([]);

      const chunks: User[][] = [];
      await repository.loadUsersInChunks(async (chunk) => {
        chunks.push(chunk);

        await Promise.resolve();
      }, 10);

      expect(chunks).toEqual([]);
      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
