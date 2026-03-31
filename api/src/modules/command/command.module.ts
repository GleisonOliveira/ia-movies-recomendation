import { Module } from '@nestjs/common';
import { TmdbCommand } from './tmdb/tmdb/tmdb-command';
import { TmdbConnector } from '@/connectors/tmdb/tmdb-connector';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TmdbCommand, TmdbConnector],
})
export class CommandModule {}
