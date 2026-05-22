import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MovieResponseDto } from '../../movie/dto/movie.response.dto';

export class ListUserLatestMoviesItemDto {
  @ApiProperty()
  @Expose()
  @Type(() => Number)
  id: number = 0;

  @ApiProperty()
  @Expose()
  @Type(() => String)
  name: string = '';

  @ApiProperty()
  @Expose()
  @Type(() => Number)
  age: number = 0;

  @ApiProperty({ type: () => MovieResponseDto, isArray: true })
  @Expose()
  @Type(() => MovieResponseDto)
  latest_movies: MovieResponseDto[] = [];
}
