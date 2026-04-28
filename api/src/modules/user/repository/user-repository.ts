import { Injectable, NotFoundException } from '@nestjs/common';
import { createPaginator } from 'prisma-pagination';
import { ListUserDto } from '../dto/list.user.dto';
import { ListUserMoviesDto } from '../dto/list-user-movies.dto';
import { PrismaService } from '../../prisma/prisma-service/prisma-service';
import { UserMovie, Prisma } from '@/generatedprisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll({ per_page, page, name }: ListUserDto) {
    const paginate = createPaginator({ perPage: per_page });

    const users = await paginate<
      Prisma.UserGetPayload<{
        include: {
          movies: { include: { movie: true } };
        };
      }>,
      Prisma.UserFindManyArgs
    >(
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
        include: {
          movies: {
            take: 5,
            orderBy: {
              movie: {
                release_date: 'desc',
              },
            },
            include: {
              movie: true,
            },
          },
        },
      },
      { page },
    );

    return {
      ...users,
      data: users.data.map((u) => ({
        id: u.id,
        name: u.name,
        age: u.age,
        latest_movies: (u.movies ?? []).map((um) => um.movie),
      })),
    };
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await this.prismaService.user.create({
      data,
    });

    return user;
  }

  async addMovieToUser(userId: number, movieId: number) {
    await this.ensureUserExists(userId);
    await this.ensureMovieExists(movieId);

    const existing = await this.prismaService.userMovie.findUnique({
      where: {
        user_id_movie_id: {
          user_id: userId,
          movie_id: movieId,
        },
      },
    });

    if (existing) {
      return { alreadyLinked: true, user: await this.getUserById(userId) };
    }

    const userMovie = await this.prismaService.userMovie.create({
      data: {
        user_id: userId,
        movie_id: movieId,
      },
      include: {
        user: true,
        movie: true,
      },
    });

    return { alreadyLinked: false, user: userMovie.user };
  }

  async removeMovieFromUser(userId: number, movieId: number) {
    await this.ensureUserExists(userId);
    await this.ensureMovieExists(movieId);

    return this.prismaService.userMovie.delete({
      where: {
        user_id_movie_id: {
          user_id: userId,
          movie_id: movieId,
        },
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

  private async ensureUserExists(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private async ensureMovieExists(movieId: number) {
    const movie = await this.prismaService.movie.findUnique({
      where: { id: movieId },
      select: { id: true },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
  }

  private async getUserById(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
