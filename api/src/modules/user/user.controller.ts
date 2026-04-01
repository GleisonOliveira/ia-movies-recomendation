import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '@/modules/user/service/user-service/user-service';
import { ListUserDto } from './dto/list.user.dto';
import { ListUserResponseDto } from './dto/list.user.response.dto';
import { UserCreateDto } from './dto/user.create.dto';
import { UserResponseDto } from './dto/user.response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAll(@Query() params: ListUserDto): Promise<ListUserResponseDto> {
    const users = await this.userService.getAll(params);

    return users;
  }

  @Post()
  async create(@Body() params: UserCreateDto): Promise<UserResponseDto> {
    const user = await this.userService.create(params);

    return user;
  }
}
