import { Module } from '@nestjs/common';
import { TmdbConnector } from './tmdb/tmdb-connector';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TmdbConnector],
})
export class ConnectorsModule {}
