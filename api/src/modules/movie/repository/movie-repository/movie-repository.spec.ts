import { Test, TestingModule } from '@nestjs/testing';
import { MovieRepository } from './movie-repository';

describe('MovieRepository', () => {
  let provider: MovieRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovieRepository],
    }).compile();

    provider = module.get<MovieRepository>(MovieRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
