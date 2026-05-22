export interface NeuralComputerInterface {
  train(): Promise<void>;
  embedMovies(): Promise<void>;
}
