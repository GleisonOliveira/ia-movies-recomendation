import { Module } from '@nestjs/common';
import { TmdbDatabaseSyncCommand } from './tmdb/tmdb-database-sync/tmdb-database-sync-command';
import { TmdbConnector } from '@/modules/connectors/tmdb/tmdb-connector';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TmdbDatabaseSyncCommand, TmdbConnector],
})
export class CommandModule {}
