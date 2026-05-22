import { Test, TestingModule } from '@nestjs/testing';
import { MovieNeuralTrainCommand } from './movie-neural-train-command';

describe('MovieNeuralTrainCommand', () => {
  let command: MovieNeuralTrainCommand;

  const neuralComputerService = { train: jest.fn() };
  const neuralComputerFactory = { create: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    neuralComputerFactory.create.mockReturnValue(neuralComputerService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieNeuralTrainCommand,
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

  it('should call train on the neural computer service', async () => {
    await command.run();

    expect(neuralComputerFactory.create).toHaveBeenCalledTimes(1);
    expect(neuralComputerService.train).toHaveBeenCalledTimes(1);
  });
});
