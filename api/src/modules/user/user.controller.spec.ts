import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './service/user-service/user-service';
import { UserRepository } from './repository/user-repository';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { ListUserDto } from './dto/list.user.dto';
import { UserCreateDto } from './dto/user.create.dto';
import { AddUserMovieDto } from './dto/add-user-movie.dto';
import { ListUserMoviesDto } from './dto/list-user-movies.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { Prisma } from '@/generatedprisma/client';
import { buildMovie } from '../../../test/movie/movie-test-utils';
import { buildUser } from '../../../test/user/user-test-utils';
import type {
  MovieFindManyResult,
  MovieFindUniqueResult,
  UserCountResult,
  UserCreateResult,
  UserFindManyResult,
  UserFindUniqueResult,
  UserMovieCountResult,
  UserMovieCreateResult,
  UserMovieDeleteResult,
  UserMovieFindManyResult,
  UserMovieFindUniqueResult,
} from '../../../test/user/user-repository-test-types';

describe('UserController', () => {
  let controller: UserController;
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
      controllers: [UserController],
      providers: [
        UserService,
        UserRepository,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should pass list params to user service', async () => {
    const params = new ListUserDto();
    params.page = 1;
    params.per_page = 10;
    params.name = 'John';

    prismaService.user.count.mockResolvedValue(1);
    prismaService.user.findMany.mockResolvedValue([
      {
        ...buildUser(),
        movies: [
          {
            user_id: 1,
            movie_id: 2,
            movie: {
              ...buildMovie({
                title: 'Movie A',
                vote_average: new Prisma.Decimal(8.4),
              }),
            },
          },
        ],
      },
    ]);

    const result = await controller.getAll(params);
    expect(result).toMatchObject({
      data: [
        expect.objectContaining({
          ...buildUser(),
          latest_movies: [
            expect.objectContaining({ id: 2, vote_average: 8.4 }),
          ],
        }),
      ],
    });
    expect(result.meta).toEqual(
      expect.objectContaining({
        total: 1,
        last_page: 1,
        current_page: 1,
        per_page: 10,
      }),
    );
  });

  it('should pass create dto to user service', async () => {
    const dto = new UserCreateDto();
    dto.name = 'John';
    dto.age = 30;

    prismaService.user.create.mockResolvedValue(buildUser());

    await expect(controller.create(dto)).resolves.toMatchObject({
      id: 1,
      name: 'John',
      age: 30,
    } satisfies UserResponseDto);
  });

  it('should pass add movie dto to user service', async () => {
    const dto = new AddUserMovieDto();
    dto.user_id = 1;
    dto.movie_id = 2;

    const user = buildUser();

    prismaService.user.findUnique
      .mockResolvedValueOnce(user) // ensureUserExists
      .mockResolvedValueOnce(user); // getUserById

    prismaService.movie.findUnique.mockResolvedValue({ id: 2 });
    prismaService.userMovie.findUnique.mockResolvedValue(null);

    prismaService.userMovie.create.mockResolvedValue({
      user_id: 1,
      movie_id: 2,
      user: buildUser(),
      movie: buildMovie({
        title: 'Movie A',
        vote_average: new Prisma.Decimal(8.4),
      }),
    });

    const res = {
      status: jest.fn().mockReturnThis(),
    };

    await expect(
      controller.addMovieToUser(dto, res as never),
    ).resolves.toMatchObject({
      id: 1,
      name: 'John',
      age: 30,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should return no content when movie is already linked', async () => {
    const dto = new AddUserMovieDto();
    dto.user_id = 1;
    dto.movie_id = 2;

    prismaService.user.findUnique.mockImplementation(
      (args: Prisma.UserFindUniqueArgs) => {
        const user = buildUser();

        if (args.select?.id) {
          return Promise.resolve(user);
        }

        return Promise.resolve(user);
      },
    );

    prismaService.movie.findUnique.mockResolvedValue({ id: 2 });
    prismaService.userMovie.findUnique.mockResolvedValue({
      user_id: 1,
      movie_id: 2,
    });

    const res = {
      status: jest.fn().mockReturnThis(),
    };

    await expect(
      controller.addMovieToUser(dto, res as never),
    ).resolves.toMatchObject({
      id: 1,
      name: 'John',
      age: 30,
    });
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('should pass remove movie dto to user service', async () => {
    const dto = new AddUserMovieDto();
    dto.user_id = 1;
    dto.movie_id = 2;

    prismaService.user.findUnique
      .mockResolvedValueOnce(buildUser()) // ensureUserExists
      .mockResolvedValueOnce(buildUser()); // getUserById not used here, but keep calls stable

    prismaService.movie.findUnique.mockResolvedValue({ id: 2 });
    prismaService.userMovie.delete.mockResolvedValue({
      user_id: 1,
      movie_id: 2,
      ...buildUser(),
    });

    await expect(controller.removeMovieFromUser(dto)).resolves.toMatchObject({
      id: 1,
      name: 'John',
      age: 30,
    });
  });

  it('should pass user movies query to user service', async () => {
    const movie = buildMovie({
      title: 'Movie A',
      vote_average: new Prisma.Decimal(8.4),
    });
    const params = new ListUserMoviesDto();
    params.user_id = 1;
    params.page = 1;
    params.per_page = 10;

    prismaService.userMovie.count.mockResolvedValue(1);
    prismaService.userMovie.findMany.mockResolvedValue([
      { movie_id: 2, user_id: 1 },
    ]);

    prismaService.movie.findMany.mockResolvedValue([
      {
        ...movie,
      },
    ]);

    const result = await controller.getMoviesByUserId(params);
    expect(result).toMatchObject({
      data: [{ ...movie, vote_average: Number(8.4) }],
    });
    expect(result.meta).toEqual(
      expect.objectContaining({
        total: 1,
        last_page: 1,
        current_page: 1,
        per_page: 10,
      }),
    );
  });
});
