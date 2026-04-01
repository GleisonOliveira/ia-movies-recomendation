import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from '@/modules/user/service/user-service/user-service';
import { ListUserDto } from './dto/list.user.dto';
import { ListUserResponseDto } from './dto/list.user.response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAll(@Query() params: ListUserDto): Promise<ListUserResponseDto> {
    const users = await this.userService.getAll(params);

    return users;
  }
}
