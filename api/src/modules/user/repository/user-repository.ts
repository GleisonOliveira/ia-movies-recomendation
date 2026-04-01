import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { Injectable } from '@nestjs/common';
import { createPaginator } from 'prisma-pagination';
import { ListUserDto } from '../dto/list.user.dto';
import { Prisma, User } from '@/generatedprisma/client';

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
}
