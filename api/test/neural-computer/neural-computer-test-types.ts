import type { Tensor2D } from '@tensorflow/tfjs-core';
import type { LayersModel } from '@tensorflow/tfjs-layers';

// Representa um SymbolicTensor do grafo funcional do TensorFlow.
// A propriedade `output` aponta para si mesmo — replica o comportamento real
// onde layer.output retorna o tensor de saída da camada.
export type MockSymbolicTensor = {
  output: MockSymbolicTensor;
  name?: string;
};

// Representa uma camada TF com apply() que retorna um MockSymbolicTensor.
export type MockLayer = {
  apply: jest.Mock<MockSymbolicTensor, [MockSymbolicTensor]>;
  output: MockSymbolicTensor;
};

// Subconjunto tipado de LayersModel com apenas os métodos usados no serviço.
export type MockModel = Pick<LayersModel, 'compile'> & {
  fit: jest.Mock<Promise<void>, Parameters<LayersModel['fit']>>;
  save: jest.Mock<Promise<void>, [string]>;
  getLayer: jest.Mock<MockLayer, [string]>;
  compile: jest.Mock;
};

// Subconjunto tipado de Tensor2D com os métodos usados no serviço.
export type MockTensor = Pick<Tensor2D, 'shape'> & {
  dispose: jest.Mock<void, []>;
  data: jest.Mock<Promise<Float32Array>, []>;
};
