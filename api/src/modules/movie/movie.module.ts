import { Module } from '@nestjs/common';
import { MovieRepository } from './repository/movie-repository/movie-repository';
import { MovieService } from './service/movie-service/movie-service';
import { MovieController } from './movie.controller';

@Module({
  providers: [MovieRepository, MovieService],
  exports: [MovieRepository, MovieService],
  controllers: [MovieController],
})
export class MovieModule {}
