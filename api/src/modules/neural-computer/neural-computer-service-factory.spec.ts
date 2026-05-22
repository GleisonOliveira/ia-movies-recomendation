import { Test, TestingModule } from '@nestjs/testing';
import { NeuralComputerServiceFactory } from './neural-computer-service-factory';
import { TmdbNeuralService } from './tmdb/tmdb-neural-service';
import { MovieDataNormalizationService } from './services/normalizers/movie-data-normalization.service';
import { UserDataNormalizationService } from './services/normalizers/user-data-normalization.service';
import { MovieRepository } from '@/modules/movie/repository/movie-repository/movie-repository';
import { UserRepository } from '@/modules/user/repository/user-repository';
import { MovieCollectionService } from './services/collectors/movie-collection.service';
import { UserCollectionService } from './services/collectors/user-collection.service';
import { NormalizationService } from './tmdb/services/normalization.service';
import { TrainingDatasetService } from './tmdb/services/training-dataset.service';
import { ModelTrainingService } from './tmdb/services/model-training.service';
import { ModelExportService } from './tmdb/services/model-export.service';
import { MovieEmbeddingService } from './tmdb/services/movie-embedding.service';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import { Neo4jService } from '@/modules/neo4j/neo4j.service';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { ConfigService } from '@nestjs/config';

describe('NeuralComputerServiceFactory', () => {
  let factory: NeuralComputerServiceFactory;
  let tmdbNeuralService: TmdbNeuralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbNeuralService,
        NeuralComputerServiceFactory,
        MovieRepository,
        UserRepository,
        MovieDataNormalizationService,
        UserDataNormalizationService,
        MovieCollectionService,
        UserCollectionService,
        NormalizationService,
        TrainingDatasetService,
        ModelTrainingService,
        ModelExportService,
        MovieEmbeddingService,
        { provide: TfjsNodeService, useValue: { tf: {} } },
        {
          provide: Neo4jService,
          useValue: { upsertMovieEmbedding: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: {
            movie: { findMany: jest.fn().mockResolvedValue([]) },
            user: { findMany: jest.fn().mockResolvedValue([]) },
            userMovie: { findMany: jest.fn().mockResolvedValue([]) },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(() => './models'),
            get: jest.fn(() => undefined),
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
