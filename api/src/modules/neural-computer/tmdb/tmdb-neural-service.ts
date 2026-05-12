import { Injectable, Logger } from '@nestjs/common';
import { NeuralComputerInterface } from '../../../interfaces/neural-computer/neural-computer-interface';
import {
  MovieDataNormalizationService,
  type MovieFeatureAggregates,
} from '../services/movie-data-normalization.service';
import { MovieRepository } from '@/modules/movie/repository/movie-repository/movie-repository';

const CHUNK_SIZE = 200;

@Injectable()
export class TmdbNeuralService implements NeuralComputerInterface {
  private readonly logger = new Logger(TmdbNeuralService.name);

  constructor(
    private readonly movieDataNormalizationService: MovieDataNormalizationService,
    private readonly movieRepository: MovieRepository,
  ) {}

  async train(): Promise<void> {
    try {
      const aggregates = await this.#fitMovieFeatureAggregates();
      await this.#iterateAndNormalizeMovies(aggregates);
    } catch (error) {
      this.logger.error(error);
    }
  }

  #fitMovieFeatureAggregates(): Promise<MovieFeatureAggregates> {
    const agg =
      this.movieDataNormalizationService.createEmptyMovieFeatureAggregates();

    return this.movieRepository
      .loadMoviesInChunks(async (movies) => {
        for (const movie of movies) {
          this.movieDataNormalizationService.updateMovieFeatureAggregates(
            agg,
            movie,
          );
        }

        return Promise.resolve();
      }, CHUNK_SIZE)
      .then(() =>
        this.movieDataNormalizationService.finalizeMovieFeatureAggregates(agg),
      );
  }

  #iterateAndNormalizeMovies(agg: MovieFeatureAggregates): Promise<void> {
    return this.movieRepository.loadMoviesInChunks((movies) => {
      for (const movie of movies) {
        this.movieDataNormalizationService.normalizeMovieForTensor(movie, agg);
      }

      return Promise.resolve();
    }, CHUNK_SIZE);
  }
}
