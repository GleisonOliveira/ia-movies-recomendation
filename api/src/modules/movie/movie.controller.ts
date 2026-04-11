import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MovieService } from './service/movie-service/movie-service';
import { ListMoviesDto } from './dto/list.movies.dto';
import { ListMoviesResponseDto } from './dto/list.movies.response.dto';

@ApiTags('movie')
@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @ApiOperation({ summary: 'List movies' })
  @ApiOkResponse({ type: ListMoviesResponseDto })
  async getAll(@Query() params: ListMoviesDto): Promise<ListMoviesResponseDto> {
    const movies = await this.movieService.getAll(params);

    return movies;
  }
}
