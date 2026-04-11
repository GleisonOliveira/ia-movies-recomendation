import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class MovieResponseDto {
  @ApiProperty()
  @Expose()
  @Type(() => Number)
  id: number = 0;

  @ApiProperty()
  @Expose()
  @Type(() => String)
  title: string = '';

  @ApiProperty()
  @Expose()
  @Type(() => Number)
  external_id: number = 0;

  @ApiProperty()
  @Expose()
  @Type(() => String)
  original_language: string = '';

  @ApiProperty()
  @Expose()
  @Type(() => String)
  overview: string = '';

  @ApiProperty()
  @Expose()
  @Type(() => Number)
  popularity: number = 0;

  @ApiProperty({ nullable: true })
  @Expose()
  @Type(() => String)
  poster_path: string | null = null;

  @ApiProperty()
  @Expose()
  @Type(() => Boolean)
  adult: boolean = false;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  release_date: Date = new Date();

  @ApiProperty()
  @Expose()
  @Type(() => Number)
  vote_average: number = 0;

  @ApiProperty()
  @Expose()
  @Type(() => Number)
  vote_count: number = 0;
}
