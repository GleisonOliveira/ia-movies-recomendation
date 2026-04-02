import { Module } from '@nestjs/common';
import { TmdbNeuralService } from './tmdb/tmdb-neural-service';
import { NeuralComputerServiceFactory } from './neural-computer-service-factory';

@Module({
  providers: [TmdbNeuralService, NeuralComputerServiceFactory],
  exports: [NeuralComputerServiceFactory],
})
export class NeuralComputerModule {}
