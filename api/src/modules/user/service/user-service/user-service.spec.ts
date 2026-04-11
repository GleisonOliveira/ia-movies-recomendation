import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user-service';
import { UserRepository } from '../../repository/user-repository';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { ListUserDto } from '../../dto/list.user.dto';
import { UserCreateDto } from '../../dto/user.create.dto';
import { AddUserMovieDto } from '../../dto/add-user-movie.dto';
import { ListUserMoviesDto } from '../../dto/list-user-movies.dto';

describe('UserService', () => {
  let service: UserService;
  const prismaService = {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    userMovie: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    movie: {
      findMany: jest.fn(),
    },
  };

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

    prismaService.user.count.mockResolvedValue(1);
    prismaService.user.findMany.mockResolvedValue([{ id: 1, name: 'John' }]);

    await expect(service.getAll(params)).resolves.toEqual({
      data: [{ id: 1, name: 'John' }],
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

  it('should create a user', async () => {
    const dto = new UserCreateDto();
    dto.name = 'John';
    dto.age = 30;

    prismaService.user.create.mockResolvedValue({
      id: 1,
      name: 'John',
      age: 30,
    });

    await expect(service.create(dto)).resolves.toEqual({
      id: 1,
      name: 'John',
      age: 30,
    });
  });

  it('should add a movie to a user', async () => {
    const dto = new AddUserMovieDto();
    dto.user_id = 1;
    dto.movie_id = 2;

    prismaService.userMovie.findUnique.mockResolvedValue(null);
    prismaService.userMovie.create.mockResolvedValue({
      id: 1,
      name: 'John',
      age: 30,
    });

    await expect(service.addMovieToUser(dto)).resolves.toEqual({
      id: 1,
      name: 'John',
      age: 30,
    });
  });

  it('should get movies by user id with plainToInstance', async () => {
    const params = new ListUserMoviesDto();
    params.user_id = 1;
    params.page = 1;
    params.per_page = 10;

    prismaService.userMovie.count.mockResolvedValue(1);
    prismaService.userMovie.findMany.mockResolvedValue([{ movie_id: 1 }]);
    prismaService.movie.findMany.mockResolvedValue([
      {
        id: 1,
        title: 'Movie A',
        vote_average: { toNumber: () => 8.4 },
      },
    ]);

    await expect(service.getMoviesByUserId(params)).resolves.toMatchObject({
      data: [
        {
          id: 1,
          title: 'Movie A',
          vote_average: 8.4,
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
