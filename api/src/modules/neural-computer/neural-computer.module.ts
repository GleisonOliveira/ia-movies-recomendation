import { Module } from '@nestjs/common';
import { TmdbNeuralService } from './tmdb/tmdb-neural-service';
import { NeuralComputerServiceFactory } from './neural-computer-service-factory';
import { TensorflowModule } from '@/modules/tensorflow/tensorflow.module';

@Module({
  imports: [TensorflowModule],
  providers: [TmdbNeuralService, NeuralComputerServiceFactory],
  exports: [NeuralComputerServiceFactory],
})
export class NeuralComputerModule {}
