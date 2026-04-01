import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { Injectable } from '@nestjs/common';
import { createPaginator } from 'prisma-pagination';
import { ListUserDto } from '../dto/list.user.dto';
import { Prisma, User } from '@/generatedprisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll({ per_page, page }: ListUserDto) {
    const paginate = createPaginator({ perPage: per_page });

    const users = await paginate<User, Prisma.UserFindManyArgs>(
      this.prismaService.user,
      {},
      { page },
    );

    return users;
  }
}
