import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const databaseUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@db:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

    const adapter = new PrismaPg({
      connectionString: databaseUrl,
    });
    super({ adapter });
  }
}
