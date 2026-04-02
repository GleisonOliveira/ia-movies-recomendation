import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { ListMoviesDto } from '../../dto/list.movies.dto';
import { createPaginator } from 'prisma-pagination';
import { Movie, Prisma } from '@/generatedprisma/client';

@Injectable()
export class MovieRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll({ per_page, page, name }: ListMoviesDto) {
    const paginate = createPaginator({ perPage: per_page });

    const movies = await paginate<Movie, Prisma.MovieFindManyArgs>(
      this.prismaService.movie,
      {
        where: name
          ? {
              title: {
                contains: name,
                mode: 'insensitive',
              },
            }
          : undefined,
      },
      { page },
    );

    return movies;
  }

  async findById(id: number): Promise<Movie | null> {
    return this.prismaService.movie.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.MovieCreateInput): Promise<Movie> {
    return this.prismaService.movie.create({ data });
  }

  async findLatestReleaseDate(): Promise<Date | null> {
    const latestMovie = await this.prismaService.movie.findFirst({
      orderBy: { release_date: 'desc' },
      select: { release_date: true },
    });

    return latestMovie?.release_date || null;
  }
}
