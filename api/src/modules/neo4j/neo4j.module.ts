import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver } from 'neo4j-driver';

export const NEO4J_DRIVER = Symbol('NEO4J_DRIVER');

@Global()
@Module({
  providers: [
    {
      provide: NEO4J_DRIVER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Driver => {
        const host = configService.get<string>('NEO4J_HOST', 'neo4j');
        const port = configService.get<number>('NEO4J_PORT', 7687);
        const database = configService.get<string>('NEO4J_DATABASE', 'neo4j');
        const user = configService.get<string>('NEO4J_USER');
        const password = configService.get<string>('NEO4J_PASSWORD');

        if (!user || !password) {
          throw new Error('Missing NEO4J_USER or NEO4J_PASSWORD');
        }

        // `neo4j-driver` does not support `?database=...` query params on `bolt://` URIs.
        // We keep a plain bolt URI and leave database selection to server/default behavior.
        // (If you need per-session database selection, pass `database` to `driver.session({ database })`.)
        void database;
        const uri = `bolt://${host}:${port}`;

        return neo4j.driver(uri, neo4j.auth.basic(user, password), {
          // Safe defaults for a containerized dev environment.
          maxConnectionLifetime: 0,
        });
      },
    },
  ],
  exports: [NEO4J_DRIVER],
})
export class Neo4jModule {}
