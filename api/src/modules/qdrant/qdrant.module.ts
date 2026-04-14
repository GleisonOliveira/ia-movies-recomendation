import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';

export const QDRANT_CLIENT = Symbol('QDRANT_CLIENT');

@Global()
@Module({
  providers: [
    {
      provide: QDRANT_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('QDRANT_HOST', 'qdrant');
        const port = configService.get<number>('QDRANT_PORT', 6333);

        return new QdrantClient({ host, port });
      },
    },
  ],
  exports: [QDRANT_CLIENT],
})
export class QdrantModule {}
