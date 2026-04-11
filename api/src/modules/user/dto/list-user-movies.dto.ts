import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListUserMoviesDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  user_id: number = 0;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  per_page?: number = 10;
}
