import { Injectable } from '@nestjs/common';
import { MovieRepository } from '../../repository/movie-repository/movie-repository';
import { ListMoviesDto } from '../../dto/list.movies.dto';
import { ListMoviesResponseDto } from '../../dto/list.movies.response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MovieService {
  constructor(private readonly movieRepository: MovieRepository) {}

  async getAll(params: ListMoviesDto): Promise<ListMoviesResponseDto> {
    const data = await this.movieRepository.getAll(params);

    return plainToInstance(ListMoviesResponseDto, data);
  }
}
