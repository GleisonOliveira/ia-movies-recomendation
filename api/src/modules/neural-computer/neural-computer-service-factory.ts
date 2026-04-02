import { Injectable } from '@nestjs/common';
import { NeuralComputerFactoryServiceInterface } from '../../interfaces/neural-computer/neural-computer-factory-service-interface';
import { NeuralComputerInterface } from '../../interfaces/neural-computer/neural-computer-interface';
import { TmdbNeuralService } from './tmdb/tmdb-neural-service';

@Injectable()
export class NeuralComputerServiceFactory implements NeuralComputerFactoryServiceInterface {
  constructor(private readonly tmdbNeuralService: TmdbNeuralService) {}

  create(): NeuralComputerInterface {
    return this.tmdbNeuralService;
  }
}
