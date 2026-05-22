import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NeuralComputerInterface } from '../../../interfaces/neural-computer/neural-computer-interface';
import { UserRepository } from '@/modules/user/repository/user-repository';
import { MovieCollectionService } from '../services/collectors/movie-collection.service';
import { UserCollectionService } from '../services/collectors/user-collection.service';
import { NormalizationService } from './services/normalization.service';
import { TrainingDatasetService } from './services/training-dataset.service';
import { ModelTrainingService } from './services/model-training.service';
import { ModelExportService } from './services/model-export.service';
import { MovieEmbeddingService } from './services/movie-embedding.service';

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
    private readonly userRepository: UserRepository,
    private readonly movieCollectionService: MovieCollectionService,
    private readonly userCollectionService: UserCollectionService,
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
      ]);
      this.logger.log('Training complete. Model saved.');
    } catch (error) {
      this.logger.error('Training failed', error);
      throw error;
    }
  }

  async embedMovies(): Promise<void> {
    await this.movieEmbeddingService.embedMovies(this.modelPath);
  }
}
