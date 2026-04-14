import { Module } from '@nestjs/common';
import { TmdbDatabaseSyncCommand } from './tmdb/tmdb-database-sync/tmdb-database-sync-command';
import { TmdbConnector } from '@/modules/connectors/tmdb/tmdb-connector';
import { HttpModule } from '@nestjs/axios';
import { MovieModule } from '../movie/movie.module';
import { ConnectorsModule } from '../connectors/connectors.module';
import { MovieNeuralTrainCommand } from './movie/movie-neural-train/movie-neural-train-command';
import { PrismaService } from '../prisma/prisma-service/prisma-service';
import { TmdbNeuralService } from '../neural-computer/tmdb/tmdb-neural-service';
import { NeuralComputerServiceFactory } from '../neural-computer/neural-computer-service-factory';

@Module({
  imports: [HttpModule, MovieModule, ConnectorsModule],
  providers: [
    TmdbDatabaseSyncCommand,
    MovieNeuralTrainCommand,
    TmdbConnector,
    PrismaService,
    TmdbNeuralService,
    NeuralComputerServiceFactory,
    {
      provide: 'NeuralComputerFactoryServiceInterface',
      useExisting: NeuralComputerServiceFactory,
    },
  ],
})
export class CommandModule {}
