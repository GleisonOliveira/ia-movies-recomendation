import { Injectable, Logger } from '@nestjs/common';
import { NeuralComputerInterface } from '../../../interfaces/neural-computer/neural-computer-interface';
import {
  MovieDataNormalizationService,
  type MovieFeatureAggregates,
} from '../services/movie-data-normalization.service';
import {
  UserDataNormalizationService,
  type UserFeatureAggregates,
} from '../services/user-data-normalization.service';
import { MovieRepository } from '@/modules/movie/repository/movie-repository/movie-repository';
import { UserRepository } from '@/modules/user/repository/user-repository';

const CHUNK_SIZE = 200;

@Injectable()
export class TmdbNeuralService implements NeuralComputerInterface {
  private readonly logger = new Logger(TmdbNeuralService.name);

  constructor(
    private readonly movieDataNormalizationService: MovieDataNormalizationService,
    private readonly userDataNormalizationService: UserDataNormalizationService,
    private readonly movieRepository: MovieRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async train(): Promise<void> {
    try {
      const [movieAgg, userAgg] = await Promise.all([
        this.#fitMovieFeatureAggregates(),
        this.#fitUserFeatureAggregates(),
      ]);

      await Promise.all([
        this.#iterateAndNormalizeMovies(movieAgg),
        this.#iterateAndNormalizeUsers(userAgg),
      ]);
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
          this.logger.log(`Processing aggregates from ${movie.title}`);

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

  #fitUserFeatureAggregates(): Promise<UserFeatureAggregates> {
    const agg =
      this.userDataNormalizationService.createEmptyUserFeatureAggregates();

    return this.userRepository
      .loadUsersInChunks(async (users) => {
        for (const user of users) {
          this.logger.log(`Processing aggregates from user ${user.id}`);

          this.userDataNormalizationService.updateUserFeatureAggregates(
            agg,
            user,
          );
        }

        return Promise.resolve();
      }, CHUNK_SIZE)
      .then(() =>
        this.userDataNormalizationService.finalizeUserFeatureAggregates(agg),
      );
  }

  #iterateAndNormalizeMovies(agg: MovieFeatureAggregates): Promise<void> {
    return this.movieRepository.loadMoviesInChunks((movies) => {
      for (const movie of movies) {
        this.logger.log(`Normalqalizing ${movie.title} for tensors`);

        this.movieDataNormalizationService.normalizeMovieForTensor(movie, agg);
      }

      return Promise.resolve();
    }, CHUNK_SIZE);
  }

  #iterateAndNormalizeUsers(agg: UserFeatureAggregates): Promise<void> {
    return this.userRepository.loadUsersInChunks((users) => {
      for (const user of users) {
        this.logger.log(`Normalizing user ${user.id} for tensors`);

        this.userDataNormalizationService.normalizeUserForTensor(user, agg);
      }

      return Promise.resolve();
    }, CHUNK_SIZE);
  }
}
