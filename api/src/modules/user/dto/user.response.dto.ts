import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
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
}
