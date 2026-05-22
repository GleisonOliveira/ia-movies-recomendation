import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { MovieResponseDto } from '@/modules/movie/dto/movie.response.dto';
import { ListMoviesResponseDto } from '@/modules/movie/dto/list.movies.response.dto';
import { NeuralComputerServiceFactory } from '../neural-computer-service-factory';
import { decimalToNumber } from '@/shared/prisma/decimal-to-number';

@Injectable()
export class RecommendService {
  constructor(
    private readonly neuralComputerServiceFactory: NeuralComputerServiceFactory,
  ) {}

  async recommend(userId: number): Promise<ListMoviesResponseDto> {
    const movies = await this.neuralComputerServiceFactory
      .create()
      .recommend(userId);

    const data = plainToInstance(
      MovieResponseDto,
      movies.map((movie) => ({
        ...movie,
        vote_average: decimalToNumber(movie.vote_average),
      })),
    );

    return plainToInstance(ListMoviesResponseDto, {
      data,
      meta: {
        total: data.length,
        lastPage: 1,
        currentPage: 1,
        perPage: data.length,
        prev: null,
        next: null,
      },
    });
  }
}
