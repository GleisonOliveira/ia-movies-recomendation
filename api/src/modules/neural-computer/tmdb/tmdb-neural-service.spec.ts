import { Test, TestingModule } from '@nestjs/testing';
import { TmdbNeuralService } from './tmdb-neural-service';

describe('TmdbNeuralService', () => {
  let service: TmdbNeuralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TmdbNeuralService],
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
