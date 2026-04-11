import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './service/movie-service/movie-service';
import { ListMoviesDto } from './dto/list.movies.dto';
import { ListMoviesResponseDto } from './dto/list.movies.response.dto';
import { MovieResponseDto } from './dto/movie.response.dto';

describe('MovieController', () => {
  let controller: MovieController;
  const movieService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    createMovie: jest.fn(),
    getLatestReleaseDate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [{ provide: MovieService, useValue: movieService }],
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

    const movie = new MovieResponseDto();
    movie.id = 1;
    movie.title = 'Movie A';
    movie.vote_average = 8.5;

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
    movieService.getAll.mockResolvedValue(response);

    await expect(controller.getAll(params)).resolves.toBe(response);
    expect(movieService.getAll).toHaveBeenCalledWith(params);
  });
});
