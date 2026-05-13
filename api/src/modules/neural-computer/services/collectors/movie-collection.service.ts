import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MovieRepository } from '@/modules/movie/repository/movie-repository/movie-repository';
import { MovieDataNormalizationService } from '../normalizers/movie-data-normalization.service';
import { Movie } from '@/generatedprisma/client';
import { type MovieCollectResult } from '../types';

const DEFAULT_CHUNK_SIZE = 200;

@Injectable()
export class MovieCollectionService {
  private readonly logger = new Logger(MovieCollectionService.name);

  constructor(
    private readonly movieRepository: MovieRepository,
    private readonly movieDataNormalizationService: MovieDataNormalizationService,
    private readonly configService: ConfigService,
  ) {}

  async collectAndFitMovies(): Promise<MovieCollectResult> {
    const chunkSize =
      this.configService.get<number>('MOVIE_COLLECTION_CHUNK_SIZE') ??
      DEFAULT_CHUNK_SIZE;
    const agg =
      this.movieDataNormalizationService.createEmptyMovieFeatureAggregates();
    const movies: Movie[] = [];

    return this.movieRepository
      .loadMoviesInChunks(async (chunk) => {
        for (const movie of chunk) {
          movies.push(movie);
          this.logger.log(`Processing aggregates from ${movie.title}`);
          this.movieDataNormalizationService.updateMovieFeatureAggregates(
            agg,
            movie,
          );
        }

        await Promise.resolve();
      }, chunkSize)
      .then(() => ({
        movies,
        aggregates:
          this.movieDataNormalizationService.finalizeMovieFeatureAggregates(
            agg,
          ),
      }));
  }
}
