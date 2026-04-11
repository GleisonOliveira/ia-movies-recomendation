import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ListUserDto } from './dto/list.user.dto';
import { ListUserResponseDto } from './dto/list.user.response.dto';
import { UserCreateDto } from './dto/user.create.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { AddUserMovieDto } from './dto/add-user-movie.dto';
import { ListUserMoviesDto } from './dto/list-user-movies.dto';
import { ListMoviesResponseDto } from '../movie/dto/list.movies.response.dto';
import { UserService } from './service/user-service/user-service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({ type: ListUserResponseDto })
  async getAll(@Query() params: ListUserDto): Promise<ListUserResponseDto> {
    const users = await this.userService.getAll(params);

    return users;
  }

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: UserCreateDto })
  @ApiCreatedResponse({ type: UserResponseDto })
  async create(@Body() params: UserCreateDto): Promise<UserResponseDto> {
    const user = await this.userService.create(params);

    return user;
  }

  @Post('movie')
  @ApiOperation({ summary: 'Add a movie to a user' })
  @ApiBody({ type: AddUserMovieDto })
  @ApiOkResponse({ type: UserResponseDto })
  async addMovieToUser(
    @Body() params: AddUserMovieDto,
  ): Promise<UserResponseDto> {
    return this.userService.addMovieToUser(params);
  }

  @Get('movie')
  @ApiOperation({ summary: 'List movies by user' })
  @ApiOkResponse({ type: ListMoviesResponseDto })
  async getMoviesByUserId(
    @Query() params: ListUserMoviesDto,
  ): Promise<ListMoviesResponseDto> {
    return this.userService.getMoviesByUserId(params);
  }
}
