import { Module } from '@nestjs/common';
import { TmdbDatabaseSyncCommand } from './tmdb/tmdb-database-sync/tmdb-database-sync-command';
import { TmdbConnector } from '@/modules/connectors/tmdb/tmdb-connector';
import { HttpModule } from '@nestjs/axios';
import { MovieModule } from '../movie/movie.module';
import { ConnectorsModule } from '../connectors/connectors.module';
import { MovieNeuralTrainCommand } from './movie/movie-neural-train/movie-neural-train-command';
import { MovieNeuralEmbedCommand } from './movie/movie-neural-embed/movie-neural-embed-command';
import { PrismaService } from '../prisma/prisma-service/prisma-service';
import { NeuralComputerModule } from '../neural-computer/neural-computer.module';

@Module({
  imports: [HttpModule, MovieModule, ConnectorsModule, NeuralComputerModule],
  providers: [
    TmdbDatabaseSyncCommand,
    MovieNeuralTrainCommand,
    MovieNeuralEmbedCommand,
    TmdbConnector,
    PrismaService,
  ],
})
export class CommandModule {}
