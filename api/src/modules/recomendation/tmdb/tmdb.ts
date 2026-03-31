import { Injectable } from '@nestjs/common';
import { RecomendationServiceInterface } from '@/interfaces/recomendation-service/recomendation-service-interface.interface';

@Injectable()
export class Tmdb implements RecomendationServiceInterface {}
