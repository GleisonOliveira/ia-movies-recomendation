import { Expose, Type } from 'class-transformer';
import { MovieResponseDto } from '../../movie/dto/movie.response.dto';

export class ListUserLatestMoviesItemDto {
  @Expose()
  @Type(() => Number)
  id: number = 0;

  @Expose()
  @Type(() => String)
  name: string = '';

  @Expose()
  @Type(() => Number)
  age: number = 0;

  @Expose()
  @Type(() => MovieResponseDto)
  latest_movies: MovieResponseDto[] = [];
}
