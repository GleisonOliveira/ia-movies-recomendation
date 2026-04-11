import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListUserDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 50, default: 10 })
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  @IsOptional()
  per_page?: number = 10;

  @ApiPropertyOptional({ example: 'John', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Type(() => String)
  @IsOptional()
  name?: string = undefined;
}
