import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
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
import { MovieResponseDto } from '../movie/dto/movie.response.dto';
import { UserService } from './service/user-service/user-service';
import { RecommendService } from '../neural-computer/services/recommend.service';
import type { Response } from 'express';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly recommendService: RecommendService,
  ) {}

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
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserResponseDto> {
    const result = await this.userService.addMovieToUser(params);

    if (result.alreadyLinked) {
      res.status(HttpStatus.NO_CONTENT);

      return result.user;
    }

    res.status(HttpStatus.CREATED);

    return result.user;
  }

  @Delete('movie')
  @ApiOperation({ summary: 'Remove a movie from a user' })
  @ApiBody({ type: AddUserMovieDto })
  @ApiOkResponse({ type: UserResponseDto })
  async removeMovieFromUser(
    @Body() params: AddUserMovieDto,
  ): Promise<UserResponseDto> {
    return this.userService.removeMovieFromUser(params);
  }

  @Get('movie')
  @ApiOperation({ summary: 'List movies by user' })
  @ApiOkResponse({ type: ListMoviesResponseDto })
  async getMoviesByUserId(
    @Query() params: ListUserMoviesDto,
  ): Promise<ListMoviesResponseDto> {
    return this.userService.getMoviesByUserId(params);
  }

  @Get(':userId/recommend')
  @ApiOperation({ summary: 'Recommend up to 5 movies for a user' })
  @ApiOkResponse({ type: [MovieResponseDto] })
  async recommend(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<MovieResponseDto[]> {
    return this.recommendService.recommend(userId);
  }
}
