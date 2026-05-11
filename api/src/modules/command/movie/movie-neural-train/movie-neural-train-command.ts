import { Command, CommandRunner } from 'nest-commander';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NeuralComputerFactoryServiceInterface } from '@/interfaces/neural-computer/neural-computer-factory-service-interface';

@Injectable()
@Command({
  name: 'movie-neural-train',
  description: 'Train the neural computer with movies from the database',
})
export class MovieNeuralTrainCommand extends CommandRunner {
  private readonly logger = new Logger(MovieNeuralTrainCommand.name);

  constructor(
    @Inject('NeuralComputerFactoryServiceInterface')
    private readonly neuralComputerFactory: NeuralComputerFactoryServiceInterface,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Started process');

    await this.#process();

    this.logger.log('Finished process');
  }

  async #process(): Promise<void> {
    const neuralComputerService = this.neuralComputerFactory.create();

    await neuralComputerService.train();
  }
}
