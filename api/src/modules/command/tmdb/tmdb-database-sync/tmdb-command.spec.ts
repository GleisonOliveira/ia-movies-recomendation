import { Test, TestingModule } from '@nestjs/testing';
import { TmdbDatabaseSyncCommand } from './tmdb-database-sync-command';
import { TmdbConnector } from '@/modules/connectors/tmdb/tmdb-connector';
import { MovieService } from '@/modules/movie/service/movie-service/movie-service';

describe('Tmdb', () => {
  let provider: TmdbDatabaseSyncCommand;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbDatabaseSyncCommand,
        { provide: TmdbConnector, useValue: { request: jest.fn() } },
        {
          provide: MovieService,
          useValue: {
            getById: jest.fn(),
            createMovie: jest.fn(),
            getLatestReleaseDate: jest.fn(),
          },
        },
      ],
    }).compile();

    provider = module.get<TmdbDatabaseSyncCommand>(TmdbDatabaseSyncCommand);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
