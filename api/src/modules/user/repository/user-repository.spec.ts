import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma-service/prisma-service';
import { UserRepository } from './user-repository';
import { ListUserDto } from '../dto/list.user.dto';
import { ListUserMoviesDto } from '../dto/list-user-movies.dto';
import { Prisma } from '@/generatedprisma/client';

describe('UserRepository', () => {
  let repository: UserRepository;
  const prismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    userMovie: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    movie: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  it('should get all users', async () => {
    const params = new ListUserDto();
    params.page = 1;
    params.per_page = 10;
    params.name = 'Jo';

    prismaService.user.count.mockResolvedValue(1);
    prismaService.user.findMany.mockResolvedValue([{ id: 1, name: 'John' }]);

    await expect(repository.getAll(params)).resolves.toEqual({
      data: [{ id: 1, name: 'John' }],
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

  it('should create a user', async () => {
    prismaService.user.create.mockResolvedValue({ id: 1, name: 'John' });

    const data: Prisma.UserCreateInput = {
      name: 'John',
      age: 30,
    };

    await expect(repository.create(data)).resolves.toEqual({
      id: 1,
      name: 'John',
    });

    expect(prismaService.user.create).toHaveBeenCalledWith({
      data,
    });
  });

  it('should create the link when it does not exist', async () => {
    prismaService.user.findUnique.mockResolvedValue({ id: 1 });
    prismaService.movie.findUnique.mockResolvedValue({ id: 2 });
    prismaService.userMovie.findUnique.mockResolvedValue(null);
    prismaService.userMovie.create.mockResolvedValue({
      user_id: 1,
      movie_id: 2,
    });

    await expect(repository.addMovieToUser(1, 2)).resolves.toEqual({
      user_id: 1,
      movie_id: 2,
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

  it('should throw conflict when the link already exists', async () => {
    prismaService.user.findUnique.mockResolvedValue({ id: 1 });
    prismaService.movie.findUnique.mockResolvedValue({ id: 2 });
    prismaService.userMovie.findUnique.mockResolvedValue({
      user_id: 1,
      movie_id: 2,
    });

    await expect(repository.addMovieToUser(1, 2)).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(prismaService.userMovie.create).not.toHaveBeenCalled();
  });

  it('should remove the link from a user', async () => {
    prismaService.user.findUnique.mockResolvedValue({ id: 1 });
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
    prismaService.user.findUnique.mockResolvedValue({ id: 1 });
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
    prismaService.userMovie.findMany.mockResolvedValue([{ movie_id: 2 }]);
    prismaService.movie.findMany.mockResolvedValue([{ id: 2, title: 'Movie' }]);

    await expect(repository.getMoviesByUserId(params)).resolves.toEqual({
      data: [{ id: 2, title: 'Movie' }],
      meta: {
        total: 1,
        lastPage: 1,
        currentPage: 1,
        perPage: 10,
        prev: null,
        next: null,
      },
    });

    expect(prismaService.movie.findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: [2],
        },
      },
    });
  });
});
