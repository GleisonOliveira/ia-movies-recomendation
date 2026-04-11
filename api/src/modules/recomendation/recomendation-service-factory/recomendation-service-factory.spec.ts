import { Test, TestingModule } from '@nestjs/testing';
import { RecomendationServiceFactory } from './recomendation-service-factory';
import { Tmdb } from '../tmdb/tmdb';

describe('RecomendationServiceFactory', () => {
  let provider: RecomendationServiceFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecomendationServiceFactory, { provide: Tmdb, useValue: {} }],
    }).compile();

    provider = module.get<RecomendationServiceFactory>(
      RecomendationServiceFactory,
    );
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
