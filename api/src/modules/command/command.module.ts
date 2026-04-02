import { Module } from '@nestjs/common';
import { TmdbDatabaseSyncCommand } from './tmdb/tmdb-database-sync/tmdb-database-sync-command';
import { TmdbConnector } from '@/modules/connectors/tmdb/tmdb-connector';
import { HttpModule } from '@nestjs/axios';
import { MovieModule } from '../movie/movie.module';
import { ConnectorsModule } from '../connectors/connectors.module';

@Module({
  imports: [HttpModule, MovieModule, ConnectorsModule],
  providers: [TmdbDatabaseSyncCommand, TmdbConnector],
})
export class CommandModule {}
