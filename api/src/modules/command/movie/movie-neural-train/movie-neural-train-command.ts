import { Command, CommandRunner } from 'nest-commander';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';
import { NeuralComputerFactoryServiceInterface } from '@/interfaces/neural-computer/neural-computer-factory-service-interface';
import { Movie } from '@/generatedprisma/client';

const CHUNK_SIZE = 200;

@Injectable()
@Command({
  name: 'movie-neural-train',
  description: 'Train the neural computer with movies from the database',
})
export class MovieNeuralTrainCommand extends CommandRunner {
  private readonly logger = new Logger(MovieNeuralTrainCommand.name);

  constructor(
    private readonly prismaService: PrismaService,
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
    try {
      let skip = 0;

      while (true) {
        const movies = await this.prismaService.movie.findMany({
          orderBy: { id: 'asc' },
          skip,
          take: CHUNK_SIZE,
        });

        if (movies.length === 0) {
          break;
        }

        await this.#trainMovies(movies);

        if (movies.length < CHUNK_SIZE) {
          break;
        }

        skip += CHUNK_SIZE;
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async #trainMovies(movies: Movie[]): Promise<void> {
    const neuralComputerService = this.neuralComputerFactory.create();

    await neuralComputerService.train(movies);
  }
}
