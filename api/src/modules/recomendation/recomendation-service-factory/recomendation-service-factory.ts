import { Injectable } from '@nestjs/common';
import { RecomendationServiceFactoryInterface } from '@/interfaces/recomendation-service/recomendation-service-factory-interface.interface';
import { RecomendationServiceInterface } from '@/interfaces/recomendation-service/recomendation-service-interface.interface';
import { Tmdb } from '../tmdb/tmdb';

@Injectable()
export class RecomendationServiceFactory implements RecomendationServiceFactoryInterface {
  constructor(private tmdb: Tmdb) {}

  create(): RecomendationServiceInterface {
    return this.tmdb;
  }
}
