import { Module } from '@nestjs/common';
import { RecomendationModule } from './modules/recomendation/recomendation.module';
import { ConnectorsModule } from '@/modules/connectors/connectors.module';
import { ConfigModule } from '@nestjs/config';
import { CommandModule } from './modules/command/command.module';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { MovieModule } from './modules/movie/movie.module';
import { NeuralComputerModule } from './modules/neural-computer/neural-computer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommandModule,
    ConnectorsModule,
    PrismaModule,
    RecomendationModule,
    HttpModule,
    UserModule,
    MovieModule,
    NeuralComputerModule,
  ],
  controllers: [UserController],
})
export class AppModule {}
