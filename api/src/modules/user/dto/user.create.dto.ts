import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@/generatedprisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserCreateDto {
  @ApiProperty({ example: 'John Doe', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Type(() => String)
  name: string = '';

  @ApiProperty({ example: 28, minimum: 1, maximum: 150 })
  @IsInt()
  @Min(1)
  @Max(150)
  @Type(() => Number)
  age: number = 0;

  toModel(): Prisma.UserCreateInput {
    return {
      name: this.name,
      age: this.age,
    };
  }
}
