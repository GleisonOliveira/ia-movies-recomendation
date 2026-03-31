import { Test, TestingModule } from '@nestjs/testing';
import { Tmdb } from './tmdb';

describe('Tmdb', () => {
  let provider: Tmdb;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Tmdb],
    }).compile();

    provider = module.get<Tmdb>(Tmdb);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
