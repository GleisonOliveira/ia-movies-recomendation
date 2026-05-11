import { Module } from '@nestjs/common';
import { TmdbNeuralService } from './tmdb/tmdb-neural-service';
import { NeuralComputerServiceFactory } from './neural-computer-service-factory';
import { TensorflowModule } from '@/modules/tensorflow/tensorflow.module';
import { MovieDataNormalizationService } from './services/movie-data-normalization.service';
import { Neo4jModule } from '@/modules/neo4j/neo4j.module';

@Module({
  imports: [TensorflowModule, Neo4jModule],
  providers: [
    TmdbNeuralService,
    NeuralComputerServiceFactory,
    MovieDataNormalizationService,
  ],
  exports: [NeuralComputerServiceFactory],
})
export class NeuralComputerModule {}
