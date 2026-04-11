import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TmdbConnector } from './tmdb-connector';

describe('Tmdb', () => {
  let provider: TmdbConnector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbConnector,
        { provide: HttpService, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    provider = module.get<TmdbConnector>(TmdbConnector);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
