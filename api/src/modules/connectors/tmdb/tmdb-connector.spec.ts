import { Test, TestingModule } from '@nestjs/testing';
import { TmdbConnector } from './tmdb-connector';

describe('Tmdb', () => {
  let provider: TmdbConnector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TmdbConnector],
    }).compile();

    provider = module.get<TmdbConnector>(TmdbConnector);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
