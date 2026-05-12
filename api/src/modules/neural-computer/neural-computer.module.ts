import { Module } from '@nestjs/common';
import { TmdbNeuralService } from './tmdb/tmdb-neural-service';
import { NeuralComputerServiceFactory } from './neural-computer-service-factory';
import { TensorflowModule } from '@/modules/tensorflow/tensorflow.module';
import { MovieDataNormalizationService } from './services/movie-data-normalization.service';
import { Neo4jModule } from '@/modules/neo4j/neo4j.module';
import { UserModule } from '@/modules/user/user.module';
import { UserDataNormalizationService } from './services/user-data-normalization.service';
import { Neo4jService } from '@/modules/neo4j/neo4j.service';

@Module({
  imports: [TensorflowModule, Neo4jModule, UserModule],
  providers: [
    TmdbNeuralService,
    NeuralComputerServiceFactory,
    MovieDataNormalizationService,
    UserDataNormalizationService,
    Neo4jService,
  ],
  exports: [NeuralComputerServiceFactory],
})
export class NeuralComputerModule {}
