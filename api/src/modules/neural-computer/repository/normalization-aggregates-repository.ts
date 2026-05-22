import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { NormalizationAggregates } from '@/generatedprisma/client';
import {
  MovieFeatureAggregates,
  UserFeatureAggregates,
} from '../services/types';

@Injectable()
export class NormalizationAggregatesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(
    userAggregates: UserFeatureAggregates,
    movieAggregates: MovieFeatureAggregates,
  ): Promise<NormalizationAggregates> {
    return await this.prismaService.normalizationAggregates.create({
      data: {
        age_min: userAggregates.ageMin,
        age_max: userAggregates.ageMax,
        popularity_min: movieAggregates.popularityMin,
        popularity_max: movieAggregates.popularityMax,
        vote_average_min: movieAggregates.voteAverageMin,
        vote_average_max: movieAggregates.voteAverageMax,
        language_to_index: movieAggregates.languageToIndex,
      },
    });
  }

  async findLatest(): Promise<NormalizationAggregates | null> {
    return await this.prismaService.normalizationAggregates.findFirst({
      orderBy: { created_at: 'desc' },
    });
  }
}
