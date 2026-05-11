import { Injectable } from '@nestjs/common';
import { NeuralComputerInterface } from '../../../interfaces/neural-computer/neural-computer-interface';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import { Movie } from '@/generatedprisma/client';
import {
  MovieDataNormalizationService,
  type MovieNormalizedFeatures,
} from '../services/movie-data-normalization.service';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';

const CHUNK_SIZE = 200;

@Injectable()
export class TmdbNeuralService implements NeuralComputerInterface {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tfjsNodeService: TfjsNodeService,
    private readonly movieDataNormalizationService: MovieDataNormalizationService,
  ) {}

  // Exposed for the upcoming steps of embeddings/training.
  // The current `train` method is still a stub, so this is used by tests and future integration.
  getMovieNormalizedFeatures(movie: Movie): MovieNormalizedFeatures {
    return this.movieDataNormalizationService.normalizeMovieFeatures(movie);
  }

  async train(data: Movie[]): Promise<void> {
    this.tfjsNodeService.tf.data.generator();

    try {
      let skip = 0;

      while (true) {
        const movies = await this.prismaService.movie.findMany({
          orderBy: { id: 'asc' },
          skip,
          take: CHUNK_SIZE,
        });

        if (movies.length === 0) {
          break;
        }

        await this.#trainMovies(movies);

        if (movies.length < CHUNK_SIZE) {
          break;
        }

        skip += CHUNK_SIZE;
      }
    } catch (error) {
      this.logger.error(error);
    }

    this.tfjsNodeService.tf.data.generator();
    void data;
    void this.tfjsNodeService.tf;
  }
}
