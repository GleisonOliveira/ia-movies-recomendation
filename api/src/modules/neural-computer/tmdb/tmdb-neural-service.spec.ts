import { Test, TestingModule } from '@nestjs/testing';
import { TmdbNeuralService } from './tmdb-neural-service';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import { MovieDataNormalizationService } from '../services/movie-data-normalization.service';
import { Prisma, type Movie } from '@/generatedprisma/client';

describe('TmdbNeuralService', () => {
  let service: TmdbNeuralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbNeuralService,
        {
          provide: TfjsNodeService,
          useValue: { tf: {} },
        },
        {
          provide: MovieDataNormalizationService,
          useValue: {
            normalizeMovieFeatures: jest.fn().mockImplementation((m) => ({
              movie_id: (m as any).id,
              original_language: (m as any).original_language,
              popularity: (m as any).popularity,
              adult: (m as any).adult,
              vote_average: 7.8,
            })),
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

  it('getMovieNormalizedFeatures should extract only raw movie features and convert vote_average to number', () => {
    const movie: Movie = {
      id: 10,
      original_language: 'en',
      popularity: 123.45,
      adult: true,
      vote_average: new Prisma.Decimal(7.8),
    } as unknown as Movie;

    const features = service.getMovieNormalizedFeatures(movie as any);

    expect(features.movie_id).toBe(10);
    expect(features.original_language).toBe('en');
    expect(features.popularity).toBe(123.45);
    expect(features.adult).toBe(true);
    expect(features.vote_average).toBe(7.8);
  });
});
