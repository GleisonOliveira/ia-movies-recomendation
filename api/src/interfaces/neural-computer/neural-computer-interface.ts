export interface NeuralComputerInterface {
  train(data: any): Promise<void>;
}
