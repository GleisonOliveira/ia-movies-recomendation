import { ConflictException, Injectable } from '@nestjs/common';
import { createPaginator } from 'prisma-pagination';
import { ListUserDto } from '../dto/list.user.dto';
import { ListUserMoviesDto } from '../dto/list-user-movies.dto';
import { PrismaService } from '../../prisma/prisma-service/prisma-service';
import { Prisma, User, UserMovie } from '@/generatedprisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll({ per_page, page, name }: ListUserDto) {
    const paginate = createPaginator({ perPage: per_page });

    const users = await paginate<User, Prisma.UserFindManyArgs>(
      this.prismaService.user,
      {
        where: name
          ? {
              name: {
                contains: name,
                mode: 'insensitive',
              },
            }
          : undefined,
      },
      { page },
    );

    return users;
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await this.prismaService.user.create({
      data,
    });

    return user;
  }

  async addMovieToUser(userId: number, movieId: number) {
    const existing = await this.prismaService.userMovie.findUnique({
      where: {
        user_id_movie_id: {
          user_id: userId,
          movie_id: movieId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Movie already linked to this user');
    }

    return this.prismaService.userMovie.create({
      data: {
        user_id: userId,
        movie_id: movieId,
      },
      include: {
        user: true,
        movie: true,
      },
    });
  }

  async getMoviesByUserId({ user_id, page, per_page }: ListUserMoviesDto) {
    const paginate = createPaginator({ perPage: per_page });
    const links = await paginate<UserMovie, Prisma.UserMovieFindManyArgs>(
      this.prismaService.userMovie,
      {
        where: {
          user_id,
        },
      },
      { page },
    );

    return {
      ...links,
      data: await this.prismaService.movie.findMany({
        where: {
          id: {
            in: links.data.map((link) => link.movie_id),
          },
        },
      }),
    };
  }
}
