import { Module } from '@nestjs/common';
import { ConnectorsModule } from '@/modules/connectors/connectors.module';
import { ConfigModule } from '@nestjs/config';
import { CommandModule } from './modules/command/command.module';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { MovieModule } from './modules/movie/movie.module';
import { NeuralComputerModule } from './modules/neural-computer/neural-computer.module';
import { envSchema } from './config/env.schema';
import { Neo4jModule } from './modules/neo4j/neo4j.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    CommandModule,
    ConnectorsModule,
    PrismaModule,
    HttpModule,
    UserModule,
    MovieModule,
    NeuralComputerModule,
    Neo4jModule,
  ],
  controllers: [UserController],
})
export class AppModule {}
