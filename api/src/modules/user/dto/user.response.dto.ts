import { Expose, Type } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  @Type(() => Number)
  id: number = 0;

  @Expose()
  @Type(() => String)
  name: string = '';

  @Expose()
  @Type(() => Number)
  age: number = 0;
}
