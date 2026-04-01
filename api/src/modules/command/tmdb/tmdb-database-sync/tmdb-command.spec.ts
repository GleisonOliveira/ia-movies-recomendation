import { Test, TestingModule } from '@nestjs/testing';
import { TmdbDatabaseSyncCommand } from './tmdb-database-sync-command';

describe('Tmdb', () => {
  let provider: TmdbDatabaseSyncCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TmdbDatabaseSyncCommand],
    }).compile();

    provider = module.get<TmdbDatabaseSyncCommand>(TmdbDatabaseSyncCommand);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
