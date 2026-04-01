import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll() {
    return this.prismaService.user.findMany();
  }
}
