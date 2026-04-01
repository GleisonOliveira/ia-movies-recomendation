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

export class UserCreateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Type(() => String)
  name: string = '';

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
