import { Injectable } from '@nestjs/common';
import { MovieRepository } from '../../repository/movie-repository/movie-repository';
import { ListMoviesDto } from '../../dto/list.movies.dto';
import { ListMoviesResponseDto } from '../../dto/list.movies.response.dto';
import { plainToInstance } from 'class-transformer';
import { MovieCreateDto } from '../../dto/movie.create.dto';
import { Movie } from '@/generatedprisma/client';
import { decimalToNumber } from '@/shared/prisma/decimal-to-number';
import { MovieResponseDto } from '../../dto/movie.response.dto';

@Injectable()
export class MovieService {
  constructor(private readonly movieRepository: MovieRepository) {}

  async getAll(params: ListMoviesDto): Promise<ListMoviesResponseDto> {
    const data = await this.movieRepository.getAll(params);

    return plainToInstance(ListMoviesResponseDto, {
      ...data,
      data: data.data.map((movie) => this.toMovieResponse(movie)),
    });
  }

  async getById(id: number): Promise<MovieResponseDto | null> {
    const movie = await this.movieRepository.findById(id);

    return movie ? this.toMovieResponse(movie) : null;
  }

  async createMovie(dto: MovieCreateDto): Promise<MovieResponseDto> {
    const data = dto.toModel();
    const movie = await this.movieRepository.create(data);

    return this.toMovieResponse(movie);
  }

  async getLatestReleaseDate(): Promise<Date | null> {
    return this.movieRepository.findLatestReleaseDate();
  }

  private toMovieResponse(movie: Movie): MovieResponseDto {
    return plainToInstance(MovieResponseDto, {
      ...movie,
      vote_average: decimalToNumber(movie.vote_average),
    });
  }
}
