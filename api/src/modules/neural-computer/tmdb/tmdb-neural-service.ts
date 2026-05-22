import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NeuralComputerInterface } from '../../../interfaces/neural-computer/neural-computer-interface';
import { UserRepository } from '@/modules/user/repository/user-repository';
import { MovieRepository } from '@/modules/movie/repository/movie-repository/movie-repository';
import { MovieCollectionService } from '../services/collectors/movie-collection.service';
import { UserCollectionService } from '../services/collectors/user-collection.service';
import { NormalizationService } from './services/normalization.service';
import { TrainingDatasetService } from './services/training-dataset.service';
import { ModelTrainingService } from './services/model-training.service';
import { ModelExportService } from './services/model-export.service';
import { MovieEmbeddingService } from './services/movie-embedding.service';
import { NormalizationAggregatesRepository } from '../repository/normalization-aggregates-repository';
import { Neo4jService } from '@/modules/neo4j/neo4j.service';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import type { Tensor2D } from '@tensorflow/tfjs-core';
import { Movie } from '@/generatedprisma/client';

@Injectable()
export class TmdbNeuralService implements NeuralComputerInterface {
  private readonly logger = new Logger(TmdbNeuralService.name);
  private readonly modelPath: string;

  constructor(
    private readonly normalizationService: NormalizationService,
    private readonly trainingDatasetService: TrainingDatasetService,
    private readonly modelTrainingService: ModelTrainingService,
    private readonly modelExportService: ModelExportService,
    private readonly movieEmbeddingService: MovieEmbeddingService,
    private readonly normalizationAggregatesRepository: NormalizationAggregatesRepository,
    private readonly userRepository: UserRepository,
    private readonly movieRepository: MovieRepository,
    private readonly movieCollectionService: MovieCollectionService,
    private readonly userCollectionService: UserCollectionService,
    private readonly neo4jService: Neo4jService,
    private readonly tfjsNodeService: TfjsNodeService,
    private readonly configService: ConfigService,
  ) {
    this.modelPath = this.configService.getOrThrow<string>('MODEL_PATH');
  }

  async train(): Promise<void> {
    try {
      this.logger.log('Starting training phase...');

      const [movieResult, userResult] = await Promise.all([
        this.movieCollectionService.collectAndFitMovies(),
        this.userCollectionService.collectAndFitUsers(),
      ]);

      const movieFeaturesMap =
        this.normalizationService.normalizeMoviesFromMemory(
          movieResult.movies,
          movieResult.aggregates,
        );
      const userFeaturesMap =
        this.normalizationService.normalizeUsersFromMemory(
          userResult.users,
          userResult.aggregates,
        );

      // Liberar referências grandes da memória antes de carregar interações
      movieResult.movies.length = 0;
      userResult.users.length = 0;

      this.logger.log('Feature normalization complete');

      const interactions = await this.userRepository.getAllInteractions();

      this.logger.log(`Loaded ${interactions.length} user-movie interactions`);

      const { userTensor, movieTensor, labelsTensor, userDim, movieDim } =
        this.trainingDatasetService.buildTrainingDataset(
          interactions,
          userFeaturesMap,
          movieFeaturesMap,
        );

      if (userTensor.shape[0] === 0) {
        this.logger.warn('No valid training examples found, skipping training');
        userTensor.dispose();
        movieTensor.dispose();
        labelsTensor.dispose();
        return;
      }

      this.logger.log(
        `Training dataset built: ${userTensor.shape[0]} examples (userDim=${userDim}, movieDim=${movieDim})`,
      );

      const model = this.modelTrainingService.createModel(userDim, movieDim);
      await this.modelTrainingService.trainModel(
        model,
        userTensor,
        movieTensor,
        labelsTensor,
      );

      const { userEncoder, movieEncoder } =
        this.modelTrainingService.extractEncoders(model);

      await Promise.all([
        this.modelExportService.saveModel(model, `${this.modelPath}/full`),
        this.modelExportService.saveModel(
          userEncoder,
          `${this.modelPath}/user-encoder`,
        ),
        this.modelExportService.saveModel(
          movieEncoder,
          `${this.modelPath}/movie-encoder`,
        ),
        this.normalizationAggregatesRepository.save(
          userResult.aggregates,
          movieResult.aggregates,
        ),
      ]);
      this.logger.log('Training complete. Model and aggregates saved.');
    } catch (error) {
      this.logger.error('Training failed', error);
      throw error;
    }
  }

  async embedMovies(): Promise<void> {
    await this.movieEmbeddingService.embedMovies(this.modelPath);
  }

  async recommend(userId: number): Promise<Movie[]> {
    const { tf } = this.tfjsNodeService;

    // Carrega em paralelo: dados do usuário, agregados de normalização (necessários para
    // normalizar a idade com o mesmo min/max usado no treino) e filmes já assistidos
    // (excluídos da busca no Neo4j para não recomendar o que o usuário já viu).
    const [user, aggregatesRecord, watchedMovieIds] = await Promise.all([
      this.userRepository.findById(userId),
      this.normalizationAggregatesRepository.findLatest(),
      this.userRepository.getWatchedMovieIdsByUserId(userId),
    ]);

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (!aggregatesRecord) {
      throw new NotFoundException(
        'Normalization aggregates not found. Run movie-neural-train first.',
      );
    }

    // Carrega apenas o user-encoder (sub-rede esquerda do two-tower) para inferência.
    // O model completo não é necessário aqui — só precisamos do embedding do usuário.
    const userEncoder = await tf.loadLayersModel(
      `file://${this.modelPath}/user-encoder/model.json`,
    );

    // Normalização min-max idêntica à aplicada durante o treino.
    // O fallback para 1 evita divisão por zero quando todos os usuários têm a mesma idade.
    const ageRange = aggregatesRecord.age_max - aggregatesRecord.age_min || 1;
    const normalizedAge = (user.age - aggregatesRecord.age_min) / ageRange;

    // Produz um vetor de embedding denso (shape [1, embeddingDim]) que representa
    // o usuário no espaço latente aprendido pelo two-tower.
    const input = tf.tensor2d([[normalizedAge]], [1, 1]);
    const embeddingTensor = userEncoder.predict(input) as Tensor2D;
    const userEmbedding = Array.from(await embeddingTensor.data());
    // Libera tensores do backend TF para evitar vazamento de memória na GPU/CPU.
    input.dispose();
    embeddingTensor.dispose();

    // Busca os 5 filmes mais próximos ao embedding do usuário via similaridade de cosseno
    // no Neo4j, excluindo filmes já assistidos.
    const recommendedIds = await this.neo4jService.findSimilarMovies(
      userEmbedding,
      5,
      watchedMovieIds,
    );

    // Recupera as entidades Movie completas a partir dos IDs retornados pelo Neo4j.
    // O filter remove nulos que podem ocorrer se um filme foi deletado do Prisma
    // mas ainda existe como nó no Neo4j.
    const movies = await Promise.all(
      recommendedIds.map((id) => this.movieRepository.findById(id)),
    );

    return movies.filter((m): m is Movie => m !== null);
  }
}
