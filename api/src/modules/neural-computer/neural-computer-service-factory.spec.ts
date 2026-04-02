import { Test, TestingModule } from '@nestjs/testing';
import { NeuralComputerServiceFactory } from './neural-computer-service-factory';
import { TmdbNeuralService } from './tmdb/tmdb-neural-service';

describe('NeuralComputerServiceFactory', () => {
  let factory: NeuralComputerServiceFactory;
  let tmdbNeuralService: TmdbNeuralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TmdbNeuralService, NeuralComputerServiceFactory],
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
