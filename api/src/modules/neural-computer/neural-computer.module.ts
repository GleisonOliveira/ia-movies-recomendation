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
import { NormalizationService } from './tmdb/services/normalization.service';
import { TrainingDatasetService } from './tmdb/services/training-dataset.service';
import { ModelTrainingService } from './tmdb/services/model-training.service';
import { ModelExportService } from './tmdb/services/model-export.service';
import { MovieEmbeddingService } from './tmdb/services/movie-embedding.service';
import { RecommendService } from './services/recommend.service';
import { NormalizationAggregatesRepository } from './repository/normalization-aggregates-repository';

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
    NormalizationService,
    TrainingDatasetService,
    ModelTrainingService,
    ModelExportService,
    MovieEmbeddingService,
    RecommendService,
    NormalizationAggregatesRepository,
  ],
  exports: [
    NeuralComputerServiceFactory,
    'NeuralComputerFactoryServiceInterface',
    RecommendService,
    NormalizationAggregatesRepository,
  ],
})
export class NeuralComputerModule {}
