import { Movie } from '@/generatedprisma/client';

export interface NeuralComputerInterface {
  train(data: Movie[]): Promise<void>;
}
