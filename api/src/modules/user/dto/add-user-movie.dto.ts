import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddUserMovieDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  user_id: number = 0;

  @ApiProperty({ example: 12, minimum: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  movie_id: number = 0;
}
