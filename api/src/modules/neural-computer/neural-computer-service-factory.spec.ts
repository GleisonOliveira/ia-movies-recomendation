import { Test, TestingModule } from '@nestjs/testing';
import { NeuralComputerServiceFactory } from './neural-computer-service-factory';
import { TmdbNeuralService } from './tmdb/tmdb-neural-service';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import { MovieDataNormalizationService } from './services/movie-data-normalization.service';
import { UserDataNormalizationService } from './services/user-data-normalization.service';
import { MovieRepository } from '@/modules/movie/repository/movie-repository/movie-repository';
import { UserRepository } from '@/modules/user/repository/user-repository';

describe('NeuralComputerServiceFactory', () => {
  let factory: NeuralComputerServiceFactory;
  let tmdbNeuralService: TmdbNeuralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbNeuralService,
        NeuralComputerServiceFactory,
        { provide: TfjsNodeService, useValue: { tf: {} } },
        {
          provide: MovieDataNormalizationService,
          useValue: { normalizeMovieFeatures: jest.fn() },
        },
        {
          provide: UserDataNormalizationService,
          useValue: {},
        },
        {
          provide: MovieRepository,
          useValue: {
            loadMoviesInChunks: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            loadUsersInChunks: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    tmdbNeuralService = module.get<TmdbNeuralService>(TmdbNeuralService);
    factory = module.get<NeuralComputerServiceFactory>(
      NeuralComputerServiceFactory,
    );
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  it('should create an instance of TmdbNeuralService', () => {
    const service = factory.create();
    expect(service).toBe(tmdbNeuralService);
  });
});
