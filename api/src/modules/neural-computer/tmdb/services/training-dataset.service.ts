import { Injectable } from '@nestjs/common';
import type { Tensor2D } from '@tensorflow/tfjs-core';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import type {
  MovieTensorFeatures,
  UserTensorFeatures,
} from '../../services/types';

export type TrainingDataset = {
  userTensor: Tensor2D;
  movieTensor: Tensor2D;
  labelsTensor: Tensor2D;
  userDim: number;
  movieDim: number;
};

@Injectable()
export class TrainingDatasetService {
  constructor(private readonly tfjsNodeService: TfjsNodeService) {}

  buildTrainingDataset(
    interactions: { user_id: number; movie_id: number }[],
    userFeaturesMap: Map<number, UserTensorFeatures>,
    movieFeaturesMap: Map<number, MovieTensorFeatures>,
  ): TrainingDataset {
    const { tf } = this.tfjsNodeService;

    const userMoviesMap = new Map<number, Set<number>>();
    for (const { user_id, movie_id } of interactions) {
      if (!userMoviesMap.has(user_id)) userMoviesMap.set(user_id, new Set());
      userMoviesMap.get(user_id)!.add(movie_id);
    }

    const allMovieIds = Array.from(movieFeaturesMap.keys());

    const userVectors: number[][] = [];
    const movieVectors: number[][] = [];
    const labelValues: number[] = [];

    const toUserVec = (f: UserTensorFeatures) => [f.age];
    const toMovieVec = (f: MovieTensorFeatures) => [
      f.popularity,
      f.adult,
      f.vote_average,
      f.original_language_index,
    ];

    for (const { user_id, movie_id } of interactions) {
      const userFeatures = userFeaturesMap.get(user_id);
      const movieFeatures = movieFeaturesMap.get(movie_id);
      if (!userFeatures || !movieFeatures) continue;

      userVectors.push(toUserVec(userFeatures));
      movieVectors.push(toMovieVec(movieFeatures));
      labelValues.push(1);

      // Amostragem negativa: para cada interação positiva (label=1), gera uma negativa (label=0).
      // Ratio 1:1 garante que o modelo aprenda o contraste entre "gosta" e "não assistiu".
      const watched = userMoviesMap.get(user_id)!;
      const unwatchedMovies = allMovieIds.filter((id) => !watched.has(id));
      if (unwatchedMovies.length > 0) {
        const negId =
          unwatchedMovies[Math.floor(Math.random() * unwatchedMovies.length)];
        const negFeatures = movieFeaturesMap.get(negId);
        if (negFeatures) {
          userVectors.push(toUserVec(userFeatures));
          movieVectors.push(toMovieVec(negFeatures));
          labelValues.push(0);
        }
      }
    }

    const n = userVectors.length;
    const userDim = userVectors[0]?.length ?? 0;
    const movieDim = movieVectors[0]?.length ?? 0;

    const userTensor = tf.tensor2d(userVectors, [n, userDim]);
    const movieTensor = tf.tensor2d(movieVectors, [n, movieDim]);
    const labelsTensor = tf.tensor2d(labelValues, [n, 1]);

    return { userTensor, movieTensor, labelsTensor, userDim, movieDim };
  }
}
