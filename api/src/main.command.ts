import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  process.exit(0);
}
void bootstrap();
