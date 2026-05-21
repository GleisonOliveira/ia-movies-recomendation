import { Module } from '@nestjs/common';
import { MovieModule } from '@/modules/movie/movie.module';
import { TmdbNeuralService } from './tmdb/tmdb-neural-service';
import { NeuralComputerServiceFactory } from './neural-computer-service-factory';
import { TensorflowModule } from '@/modules/tensorflow/tensorflow.module';
import { MovieDataNormalizationService } from './services/normalizers/movie-data-normalization.service';
import { Neo4jModule } from '@/modules/neo4j/neo4j.module';
import { UserModule } from '@/modules/user/user.module';
import { UserDataNormalizationService } from './services/normalizers/user-data-normalization.service';
import { Neo4jService } from '@/modules/neo4j/neo4j.service';
import { MovieCollectionService } from './services/collectors/movie-collection.service';
import { UserCollectionService } from './services/collectors/user-collection.service';

@Module({
  imports: [TensorflowModule, Neo4jModule, UserModule, MovieModule],
  providers: [
    TmdbNeuralService,
    NeuralComputerServiceFactory,
    {
      provide: 'NeuralComputerFactoryServiceInterface',
      useExisting: NeuralComputerServiceFactory,
    },
    MovieDataNormalizationService,
    UserDataNormalizationService,
    MovieCollectionService,
    UserCollectionService,
    Neo4jService,
  ],
  exports: [
    NeuralComputerServiceFactory,
    'NeuralComputerFactoryServiceInterface',
  ],
})
export class NeuralComputerModule {}
