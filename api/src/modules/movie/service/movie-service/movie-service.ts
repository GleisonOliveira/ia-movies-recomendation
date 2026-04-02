import { Injectable } from '@nestjs/common';
import { MovieRepository } from '../../repository/movie-repository/movie-repository';
import { ListMoviesDto } from '../../dto/list.movies.dto';
import { ListMoviesResponseDto } from '../../dto/list.movies.response.dto';
import { plainToInstance } from 'class-transformer';
import { Movie } from '@/generatedprisma/client';
import { MovieCreateDto } from '../../dto/movie.create.dto';

@Injectable()
export class MovieService {
  constructor(private readonly movieRepository: MovieRepository) {}

  async getAll(params: ListMoviesDto): Promise<ListMoviesResponseDto> {
    const data = await this.movieRepository.getAll(params);

    return plainToInstance(ListMoviesResponseDto, {
      ...data,
      data: data.data.map((movie) => ({
        ...movie,
        vote_average: movie.vote_average.toNumber(),
      })),
    });
  }

  async getById(id: number): Promise<Movie | null> {
    return this.movieRepository.findById(id);
  }

  async createMovie(dto: MovieCreateDto): Promise<Movie> {
    const data = dto.toModel();

    return this.movieRepository.create(data);
  }

  async getLatestReleaseDate(): Promise<Date | null> {
    return this.movieRepository.findLatestReleaseDate();
  }
}
