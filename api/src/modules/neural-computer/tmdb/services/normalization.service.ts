import { Injectable, Logger } from '@nestjs/common';
import type { Movie, User } from '@/generatedprisma/client';
import { MovieDataNormalizationService } from '../../services/normalizers/movie-data-normalization.service';
import { UserDataNormalizationService } from '../../services/normalizers/user-data-normalization.service';
import type {
  MovieFeatureAggregates,
  MovieTensorFeatures,
  UserFeatureAggregates,
  UserTensorFeatures,
} from '../../services/types';

@Injectable()
export class NormalizationService {
  private readonly logger = new Logger(NormalizationService.name);

  constructor(
    private readonly movieDataNormalizationService: MovieDataNormalizationService,
    private readonly userDataNormalizationService: UserDataNormalizationService,
  ) {}

  normalizeMoviesFromMemory(
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

  normalizeUsersFromMemory(
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
}
