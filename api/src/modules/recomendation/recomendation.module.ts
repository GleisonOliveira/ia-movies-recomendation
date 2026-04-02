import { Module } from '@nestjs/common';
import { RecomendationServiceFactory } from './recomendation-service-factory/recomendation-service-factory';
import { Tmdb } from './tmdb/tmdb';

@Module({
  providers: [RecomendationServiceFactory, Tmdb],
})
export class RecomendationModule {}
