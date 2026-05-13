import { Injectable, Logger } from '@nestjs/common';
import { NeuralComputerInterface } from '../../../interfaces/neural-computer/neural-computer-interface';
import { MovieDataNormalizationService } from '../services/normalizers/movie-data-normalization.service';
import { UserDataNormalizationService } from '../services/normalizers/user-data-normalization.service';
import { MovieRepository } from '@/modules/movie/repository/movie-repository/movie-repository';
import { UserRepository } from '@/modules/user/repository/user-repository';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import { Movie } from '@/generatedprisma/client';
import { User } from '@/generatedprisma/client';
import { mkdir } from 'fs/promises';
import { resolve } from 'path';
import { MovieCollectionService } from '../services/collectors/movie-collection.service';
import { UserCollectionService } from '../services/collectors/user-collection.service';
import {
  type MovieFeatureAggregates,
  type MovieTensorFeatures,
  type UserFeatureAggregates,
  type UserTensorFeatures,
} from '../services/types';

const MODEL_PATH = resolve(__dirname, '../../../../models/affinity');

@Injectable()
export class TmdbNeuralService implements NeuralComputerInterface {
  private readonly logger = new Logger(TmdbNeuralService.name);

  constructor(
    private readonly movieDataNormalizationService: MovieDataNormalizationService,
    private readonly userDataNormalizationService: UserDataNormalizationService,
    private readonly movieRepository: MovieRepository,
    private readonly userRepository: UserRepository,
    private readonly tfjsNodeService: TfjsNodeService,
    private readonly movieCollectionService: MovieCollectionService,
    private readonly userCollectionService: UserCollectionService,
  ) {}

  async train(): Promise<void> {
    try {
      this.logger.log('Starting training phase...');

      const [movieResult, userResult] = await Promise.all([
        this.movieCollectionService.collectAndFitMovies(),
        this.userCollectionService.collectAndFitUsers(),
      ]);

      const movieFeaturesMap = this.#normalizeMoviesFromMemory(
        movieResult.movies,
        movieResult.aggregates,
      );
      const userFeaturesMap = this.#normalizeUsersFromMemory(
        userResult.users,
        userResult.aggregates,
      );

      // Liberar referências grandes da memória antes de carregar interações
      movieResult.movies.length = 0;
      userResult.users.length = 0;

      this.logger.log('Feature normalization complete');

      const interactions = await this.userRepository.getAllInteractions();

      this.logger.log(`Loaded ${interactions.length} user-movie interactions`);

      const { features, labels } = this.#buildTrainingDataset(
        interactions,
        userFeaturesMap,
        movieFeaturesMap,
      );

      if (features.shape[0] === 0) {
        this.logger.warn('No valid training examples found, skipping training');
        features.dispose();
        labels.dispose();
        return;
      }

      this.logger.log(
        `Training dataset built: ${features.shape[0]} examples, feature dim ${features.shape[1]}`,
      );

      const model = this.#createModel();
      await this.#trainModel(model, features, labels);

      await this.#saveModel(model);
      this.logger.log('Training complete. Model saved.');
    } catch (error) {
      this.logger.error('Training failed', error);
      throw error;
    }
  }

  #normalizeMoviesFromMemory(
    movies: Movie[],
    agg: MovieFeatureAggregates,
  ): Map<number, MovieTensorFeatures> {
    const featuresMap = new Map<number, MovieTensorFeatures>();

    for (const movie of movies) {
      this.logger.log(`Normalizing ${movie.title} for tensors`);

      featuresMap.set(
        movie.id,
        this.movieDataNormalizationService.normalizeMovieForTensor(movie, agg),
      );
    }

    return featuresMap;
  }

  #normalizeUsersFromMemory(
    users: User[],
    agg: UserFeatureAggregates,
  ): Map<number, UserTensorFeatures> {
    const featuresMap = new Map<number, UserTensorFeatures>();

    for (const user of users) {
      this.logger.log(`Normalizing user ${user.id} for tensors`);

      featuresMap.set(
        user.id,
        this.userDataNormalizationService.normalizeUserForTensor(user, agg),
      );
    }

    return featuresMap;
  }

  #buildTrainingDataset(
    interactions: { user_id: number; movie_id: number }[],
    userFeaturesMap: Map<number, UserTensorFeatures>,
    movieFeaturesMap: Map<number, MovieTensorFeatures>,
  ) {
    const { tf } = this.tfjsNodeService;

    // Build lookup for user -> set of movies
    const userMoviesMap = new Map<number, Set<number>>();

    for (const { user_id, movie_id } of interactions) {
      if (!userMoviesMap.has(user_id)) {
        userMoviesMap.set(user_id, new Set());
      }
      userMoviesMap.get(user_id)!.add(movie_id);
    }

    // All movie IDs for negative sampling
    const allMovieIds = Array.from(movieFeaturesMap.keys());

    const featureVectors: number[] = [];
    const labelValues: number[] = [];

    for (const { user_id, movie_id } of interactions) {
      const userFeatures = userFeaturesMap.get(user_id);
      const movieFeatures = movieFeaturesMap.get(movie_id);

      if (!userFeatures || !movieFeatures) continue;

      // Concatenate: [user_age, movie_popularity, movie_adult, movie_vote_average, movie_original_language_index]
      const featureVector = [
        userFeatures.age,
        movieFeatures.popularity,
        movieFeatures.adult,
        movieFeatures.vote_average,
        movieFeatures.original_language_index,
      ];
      featureVectors.push(featureVector);
      labelValues.push(1); // positive interaction

      // Negative sample: random movie not watched by this user
      const watched = userMoviesMap.get(user_id)!;
      const unwatchedMovies = allMovieIds.filter((id) => !watched.has(id));
      if (unwatchedMovies.length > 0) {
        const randomNegativeMovieId =
          unwatchedMovies[Math.floor(Math.random() * unwatchedMovies.length)];
        const negativeMovieFeatures = movieFeaturesMap.get(
          randomNegativeMovieId,
        );
        if (negativeMovieFeatures) {
          featureVectors.push([
            userFeatures.age,
            negativeMovieFeatures.popularity,
            negativeMovieFeatures.adult,
            negativeMovieFeatures.vote_average,
            negativeMovieFeatures.original_language_index,
          ]);
          labelValues.push(0);
        }
      }
    }

    const featuresTensor = tf.tensor2d(featureVectors, [
      featureVectors.length,
      5,
    ]);
    const labelsTensor = tf.tensor2d(labelValues, [labelValues.length, 1]);

    return { features: featuresTensor, labels: labelsTensor };
  }

  #createModel() {
    const { tf } = this.tfjsNodeService;

    const model = tf.sequential();

    // Input: 5 features
    // Hidden layer: 16 neurons, ReLU
    model.add(
      tf.layers.dense({
        units: 16,
        activation: 'relu',
        inputShape: [5],
      }),
    );

    // Output layer: 1 neuron, sigmoid
    model.add(
      tf.layers.dense({
        units: 1,
        activation: 'sigmoid',
      }),
    );

    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  async #trainModel(model: any, features: any, labels: any): Promise<void> {
    const { tf } = this.tfjsNodeService;

    return new Promise<void>((resolve, reject) => {
      model
        .fit(features, labels, {
          epochs: 10,
          batchSize: 32,
          validationSplit: 0.2,
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              this.logger.log(
                `Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}, acc = ${logs?.acc.toFixed(4)}`,
              );
            },
          },
        })
        .then(() => {
          // Clean up tensors
          features.dispose();
          labels.dispose();
          resolve();
        })
        .catch((err) => reject(err));
    });
  }

  async #saveModel(model: any): Promise<void> {
    const { tf } = this.tfjsNodeService;

    await mkdir(MODEL_PATH, { recursive: true });
    await model.save(`file://${MODEL_PATH}`);
    this.logger.log(`Model saved to ${MODEL_PATH}`);
  }
}
