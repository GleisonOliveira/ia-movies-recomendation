import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { MovieResponseDto } from '@/modules/movie/dto/movie.response.dto';
import { NeuralComputerServiceFactory } from '../neural-computer-service-factory';
import { decimalToNumber } from '@/shared/prisma/decimal-to-number';

@Injectable()
export class RecommendService {
  constructor(
    private readonly neuralComputerServiceFactory: NeuralComputerServiceFactory,
  ) {}

  async recommend(userId: number): Promise<MovieResponseDto[]> {
    const movies = await this.neuralComputerServiceFactory
      .create()
      .recommend(userId);

    return plainToInstance(
      MovieResponseDto,
      movies.map((movie) => ({
        ...movie,
        vote_average: decimalToNumber(movie.vote_average),
      })),
    );
  }
}
