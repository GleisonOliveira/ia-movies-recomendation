import { Test, TestingModule } from '@nestjs/testing';
import { MovieNeuralTrainCommand } from './movie-neural-train-command';
import { PrismaService } from '@/modules/prisma/prisma-service/prisma-service';

describe('MovieNeuralTrainCommand', () => {
  let command: MovieNeuralTrainCommand;

  const prismaService = {
    movie: {
      findMany: jest.fn(),
    },
  };

  const neuralComputerService = {
    train: jest.fn(),
  };
  const neuralComputerFactory = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    neuralComputerFactory.create.mockReturnValue(neuralComputerService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieNeuralTrainCommand,
        { provide: PrismaService, useValue: prismaService },
        {
          provide: 'NeuralComputerFactoryServiceInterface',
          useValue: neuralComputerFactory,
        },
      ],
    }).compile();

    command = module.get<MovieNeuralTrainCommand>(MovieNeuralTrainCommand);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  it('should read movies in chunks of 200 and train the neural service', async () => {
    prismaService.movie.findMany
      .mockResolvedValueOnce(
        Array.from({ length: 200 }, (_, index) => ({ id: index + 1 })),
      )
      .mockResolvedValueOnce([{ id: 201 }])
      .mockResolvedValueOnce([]);

    await command.run();

    expect(prismaService.movie.findMany).toHaveBeenNthCalledWith(1, {
      orderBy: { id: 'asc' },
      skip: 0,
      take: 200,
    });
    expect(prismaService.movie.findMany).toHaveBeenNthCalledWith(2, {
      orderBy: { id: 'asc' },
      skip: 200,
      take: 200,
    });

    expect(neuralComputerService.train).toHaveBeenNthCalledWith(
      1,
      Array.from({ length: 200 }, (_, index) => ({ id: index + 1 })),
    );
    expect(neuralComputerService.train).toHaveBeenNthCalledWith(2, [
      { id: 201 },
    ]);
    expect(neuralComputerService.train).toHaveBeenCalledTimes(2);
    expect(neuralComputerFactory.create).toHaveBeenCalledTimes(2);
  });
});
