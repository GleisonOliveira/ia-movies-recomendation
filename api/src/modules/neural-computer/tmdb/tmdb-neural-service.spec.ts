import { Test, TestingModule } from '@nestjs/testing';
import { TmdbNeuralService } from './tmdb-neural-service';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import { MovieDataNormalizationService } from '../services/movie-data-normalization.service';

describe('TmdbNeuralService', () => {
  let service: TmdbNeuralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbNeuralService,
        {
          provide: TfjsNodeService,
          useValue: {
            tf: {
              tidy: (fn: any) => fn(),
            },
          },
        },
        {
          provide: MovieDataNormalizationService,
          useValue: {
            normalizeMovieFeatures: jest.fn().mockImplementation((m) => ({
              movie_id: m.id,
              original_language: m.original_language,
              popularity: m.popularity,
              adult: m.adult,
              vote_average: 7.8,
            })),
            createEmptyMovieFeatureAggregates: jest.fn().mockReturnValue({
              popularityMin: null,
              popularityMax: null,
              voteAverageMin: null,
              voteAverageMax: null,
              languageToIndex: {},
            }),
            updateMovieFeatureAggregates: jest.fn(),
            finalizeMovieFeatureAggregates: jest.fn().mockReturnValue({
              popularityMin: 0,
              popularityMax: 1,
              voteAverageMin: 0,
              voteAverageMax: 1,
              languageToIndex: {},
            }),
            normalizeMovieForTensor: jest.fn().mockReturnValue({
              movie_id: (m: any) => m?.id,
              popularity: 0,
              adult: 0,
              vote_average: 0,
              original_language_index: 0,
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            movie: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TmdbNeuralService>(TmdbNeuralService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should train without errors', async () => {
    await expect(service.train({})).resolves.not.toThrow();
  });
});
