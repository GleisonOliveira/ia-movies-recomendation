import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './service/user-service/user-service';
import { ListUserDto } from './dto/list.user.dto';
import { UserCreateDto } from './dto/user.create.dto';
import { AddUserMovieDto } from './dto/add-user-movie.dto';
import { ListUserMoviesDto } from './dto/list-user-movies.dto';
import { ListUserResponseDto } from './dto/list.user.response.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { ListMoviesResponseDto } from '../movie/dto/list.movies.response.dto';
import { MovieResponseDto } from '../movie/dto/movie.response.dto';

describe('UserController', () => {
  let controller: UserController;
  const userService = {
    getAll: jest.fn(),
    create: jest.fn(),
    addMovieToUser: jest.fn(),
    removeMovieFromUser: jest.fn(),
    getMoviesByUserId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should pass list params to user service', async () => {
    const params = new ListUserDto();
    params.page = 1;
    params.per_page = 10;
    params.name = 'John';

    const response = new ListUserResponseDto();
    response.data = [];
    response.meta = {
      total: 0,
      last_page: 0,
      current_page: 1,
      per_page: 10,
      prev: null,
      next: null,
    };
    userService.getAll.mockResolvedValue(response);

    await expect(controller.getAll(params)).resolves.toBe(response);
    expect(userService.getAll).toHaveBeenCalledWith(params);
  });

  it('should pass create dto to user service', async () => {
    const dto = new UserCreateDto();
    dto.name = 'John';
    dto.age = 30;

    const response = new UserResponseDto();
    response.id = 1;
    response.name = 'John';
    response.age = 30;
    userService.create.mockResolvedValue(response);

    await expect(controller.create(dto)).resolves.toBe(response);
    expect(userService.create).toHaveBeenCalledWith(dto);
  });

  it('should pass add movie dto to user service', async () => {
    const dto = new AddUserMovieDto();
    dto.user_id = 1;
    dto.movie_id = 2;

    const response = new UserResponseDto();
    response.id = 1;
    response.name = 'John';
    response.age = 30;
    userService.addMovieToUser.mockResolvedValue(response);

    await expect(controller.addMovieToUser(dto)).resolves.toBe(response);
    expect(userService.addMovieToUser).toHaveBeenCalledWith(dto);
  });

  it('should pass remove movie dto to user service', async () => {
    const dto = new AddUserMovieDto();
    dto.user_id = 1;
    dto.movie_id = 2;

    const response = new UserResponseDto();
    response.id = 1;
    response.name = 'John';
    response.age = 30;
    userService.removeMovieFromUser.mockResolvedValue(response);

    await expect(controller.removeMovieFromUser(dto)).resolves.toBe(response);
    expect(userService.removeMovieFromUser).toHaveBeenCalledWith(dto);
  });

  it('should pass user movies query to user service', async () => {
    const params = new ListUserMoviesDto();
    params.user_id = 1;
    params.page = 1;
    params.per_page = 10;

    const movie = new MovieResponseDto();
    movie.id = 1;
    movie.title = 'Movie A';
    movie.vote_average = 8.4;

    const response = new ListMoviesResponseDto();
    response.data = [movie as unknown as ListMoviesResponseDto['data'][number]];
    response.meta = {
      total: 1,
      last_page: 1,
      current_page: 1,
      per_page: 10,
      prev: null,
      next: null,
    };
    userService.getMoviesByUserId.mockResolvedValue(response);

    await expect(controller.getMoviesByUserId(params)).resolves.toBe(response);
    expect(userService.getMoviesByUserId).toHaveBeenCalledWith(params);
  });
});
