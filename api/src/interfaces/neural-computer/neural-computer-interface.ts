import { Movie } from '@/generatedprisma/client';

export interface NeuralComputerInterface {
  train(): Promise<void>;
  embedMovies(): Promise<void>;
  recommend(userId: number): Promise<Movie[]>;
}
