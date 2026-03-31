import { Test, TestingModule } from '@nestjs/testing';
import { TmdbCommand } from './tmdb-command';

describe('Tmdb', () => {
  let provider: TmdbCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TmdbCommand],
    }).compile();

    provider = module.get<TmdbCommand>(TmdbCommand);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
