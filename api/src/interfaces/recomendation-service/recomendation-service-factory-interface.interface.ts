import { RecomendationServiceInterface } from './recomendation-service-interface.interface';

export interface RecomendationServiceFactoryInterface {
  create: () => RecomendationServiceInterface;
}
