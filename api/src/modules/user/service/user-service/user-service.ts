import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/modules/user/repository/user-repository';
import { ListUserDto } from '../../dto/list.user.dto';
import { ListUserResponseDto } from '../../dto/list.user.response.dto';
import { plainToInstance } from 'class-transformer';
import { UserCreateDto } from '../../dto/user.create.dto';
import { UserResponseDto } from '../../dto/user.response.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAll(params: ListUserDto): Promise<ListUserResponseDto> {
    const data = await this.userRepository.getAll(params);

    return plainToInstance(ListUserResponseDto, data);
  }

  async create(data: UserCreateDto): Promise<UserResponseDto> {
    const user = await this.userRepository.create(data.toModel());

    return plainToInstance(UserResponseDto, user);
  }
}
