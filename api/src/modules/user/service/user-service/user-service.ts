import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/modules/user/repository/user-repository';
import { ListUserDto } from '../../dto/list.user.dto';
import { ListUserResponseDto } from '../../dto/list.user.response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAll(params: ListUserDto): Promise<ListUserResponseDto> {
    const data = await this.userRepository.getAll(params);

    return plainToInstance(ListUserResponseDto, data);
  }
}
