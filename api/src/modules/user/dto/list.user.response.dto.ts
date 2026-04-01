import { UserInterface } from '@/modules/interfaces/User/user.interface';
import { Expose } from 'class-transformer';

export class ListUserResponseDto {
  @Expose()
  data: UserInterface[];
}
