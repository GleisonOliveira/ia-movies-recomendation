import { NeuralComputerInterface } from './neural-computer-interface';

export interface NeuralComputerFactoryServiceInterface {
  create(): NeuralComputerInterface;
}
