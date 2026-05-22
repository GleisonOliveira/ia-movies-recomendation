import { Injectable, Logger } from '@nestjs/common';
import type { Tensor2D } from '@tensorflow/tfjs-core';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import { MovieCollectionService } from '../../services/collectors/movie-collection.service';
import { MovieDataNormalizationService } from '../../services/normalizers/movie-data-normalization.service';
import { Neo4jService } from '@/modules/neo4j/neo4j.service';

@Injectable()
export class MovieEmbeddingService {
  private readonly logger = new Logger(MovieEmbeddingService.name);

  constructor(
    private readonly tfjsNodeService: TfjsNodeService,
    private readonly movieCollectionService: MovieCollectionService,
    private readonly movieDataNormalizationService: MovieDataNormalizationService,
    private readonly neo4jService: Neo4jService,
  ) {}

  // Pré-computa e persiste os embeddings de todos os filmes no Neo4j.
  // Deve ser executado após o treino (command:movie-neural-embed).
  // Embeddings são estáticos enquanto o modelo não for retreinado.
  async embedMovies(modelPath: string): Promise<void> {
    const { tf } = this.tfjsNodeService;

    this.logger.log('Loading movie encoder...');
    const movieEncoder = await tf.loadLayersModel(
      `file://${modelPath}/movie-encoder/model.json`,
    );

    // collectAndFitMovies calcula os agregados de normalização (min/max, índice de idiomas)
    // necessários para gerar features na mesma escala do treino.
    const { movies, aggregates } =
      await this.movieCollectionService.collectAndFitMovies();

    this.logger.log(`Generating embeddings for ${movies.length} movies...`);

    for (const movie of movies) {
      const features =
        this.movieDataNormalizationService.normalizeMovieForTensor(
          movie,
          aggregates,
        );

      // Shape [1, 4]: batch de 1 exemplo com 4 features — mesmo movieDim do treino.
      const input = tf.tensor2d(
        [
          [
            features.popularity,
            features.adult,
            features.vote_average,
            features.original_language_index,
          ],
        ],
        [1, 4],
      );

      const embeddingTensor = movieEncoder.predict(input) as Tensor2D;
      // Converte para array JS antes de liberar a memória do tensor.
      const embedding = Array.from(await embeddingTensor.data());

      // Libera memória imediatamente — cada iteração vaza ~32 floats sem dispose.
      input.dispose();
      embeddingTensor.dispose();

      // MERGE idempotente: re-rodar o comando apenas atualiza os valores.
      await this.neo4jService.upsertMovieEmbedding(movie.id, embedding);
      this.logger.log(`Embedded movie ${movie.id} (${movie.title})`);
    }

    this.logger.log('Movie embedding complete.');
  }
}
