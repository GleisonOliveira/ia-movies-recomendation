import { Module } from '@nestjs/common';
import { RecomendationModule } from './modules/recomendation/recomendation.module';
import { ConnectorsModule } from '@/connectors/connectors.module';
import { ConfigModule } from '@nestjs/config';
import { CommandModule } from './modules/command/command.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 🔥 importante
    }),
    RecomendationModule,
    ConnectorsModule,
    CommandModule,
    HttpModule,
  ],
})
export class AppModule {}
