import { Command, CommandRunner } from 'nest-commander';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NeuralComputerFactoryServiceInterface } from '@/interfaces/neural-computer/neural-computer-factory-service-interface';

@Injectable()
@Command({
  name: 'movie-neural-embed',
  description:
    'Generate and store movie embeddings using the trained movie encoder',
})
export class MovieNeuralEmbedCommand extends CommandRunner {
  private readonly logger = new Logger(MovieNeuralEmbedCommand.name);

  constructor(
    @Inject('NeuralComputerFactoryServiceInterface')
    private readonly neuralComputerFactory: NeuralComputerFactoryServiceInterface,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Started process');
    await this.neuralComputerFactory.create().embedMovies();
    this.logger.log('Finished process');
  }
}
