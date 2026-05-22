import { Test, TestingModule } from '@nestjs/testing';
import { NormalizationAggregatesRepository } from './normalization-aggregates-repository';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import {
  MovieFeatureAggregates,
  UserFeatureAggregates,
} from '../services/types';

describe('NormalizationAggregatesRepository', () => {
  let repository: NormalizationAggregatesRepository;

  const prismaService = {
    normalizationAggregates: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const userAggregates: UserFeatureAggregates = {
    ageMin: 18,
    ageMax: 60,
  };

  const movieAggregates: MovieFeatureAggregates = {
    popularityMin: 0.5,
    popularityMax: 100.0,
    voteAverageMin: 1.0,
    voteAverageMax: 9.5,
    languageToIndex: { en: 0, pt: 1 },
  };

  const savedRecord = {
    id: 1,
    age_min: 18,
    age_max: 60,
    popularity_min: 0.5,
    popularity_max: 100.0,
    vote_average_min: 1.0,
    vote_average_max: 9.5,
    language_to_index: { en: 0, pt: 1 },
    created_at: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NormalizationAggregatesRepository,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    repository = module.get<NormalizationAggregatesRepository>(
      NormalizationAggregatesRepository,
    );
  });

  describe('save', () => {
    it('should persist aggregates from user and movie collections', async () => {
      prismaService.normalizationAggregates.create.mockResolvedValue(
        savedRecord,
      );

      await expect(
        repository.save(userAggregates, movieAggregates),
      ).resolves.toEqual(savedRecord);

      expect(prismaService.normalizationAggregates.create).toHaveBeenCalledWith(
        {
          data: {
            age_min: 18,
            age_max: 60,
            popularity_min: 0.5,
            popularity_max: 100.0,
            vote_average_min: 1.0,
            vote_average_max: 9.5,
            language_to_index: { en: 0, pt: 1 },
          },
        },
      );
    });
  });

  describe('findLatest', () => {
    it('should return most recent record', async () => {
      prismaService.normalizationAggregates.findFirst.mockResolvedValue(
        savedRecord,
      );

      await expect(repository.findLatest()).resolves.toEqual(savedRecord);

      expect(
        prismaService.normalizationAggregates.findFirst,
      ).toHaveBeenCalledWith({
        orderBy: { created_at: 'desc' },
      });
    });

    it('should return null when no record exists', async () => {
      prismaService.normalizationAggregates.findFirst.mockResolvedValue(null);

      await expect(repository.findLatest()).resolves.toBeNull();
    });
  });
});
