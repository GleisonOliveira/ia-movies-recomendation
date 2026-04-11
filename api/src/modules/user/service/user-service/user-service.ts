import { Injectable } from '@nestjs/common';
import { ListUserDto } from '../../dto/list.user.dto';
import { ListUserResponseDto } from '../../dto/list.user.response.dto';
import { plainToInstance } from 'class-transformer';
import { UserCreateDto } from '../../dto/user.create.dto';
import { UserResponseDto } from '../../dto/user.response.dto';
import { AddUserMovieDto } from '../../dto/add-user-movie.dto';
import { ListUserMoviesDto } from '../../dto/list-user-movies.dto';
import { ListMoviesResponseDto } from '../../../movie/dto/list.movies.response.dto';
import { UserRepository } from '../../repository/user-repository';
import { Movie } from '@/generatedprisma/client';
import { decimalToNumber } from '@/shared/prisma/decimal-to-number';

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

  async addMovieToUser(data: AddUserMovieDto): Promise<UserResponseDto> {
    const user = await this.userRepository.addMovieToUser(
      data.user_id,
      data.movie_id,
    );

    return plainToInstance(UserResponseDto, user);
  }

  async removeMovieFromUser(data: AddUserMovieDto): Promise<UserResponseDto> {
    const user = await this.userRepository.removeMovieFromUser(
      data.user_id,
      data.movie_id,
    );

    return plainToInstance(UserResponseDto, user);
  }

  async getMoviesByUserId(
    params: ListUserMoviesDto,
  ): Promise<ListMoviesResponseDto> {
    const data = await this.userRepository.getMoviesByUserId(params);

    return plainToInstance(ListMoviesResponseDto, {
      ...data,
      data: data.data.map((movie: Movie) => ({
        ...movie,
        vote_average: decimalToNumber(movie.vote_average),
      })),
    });
  }
}
