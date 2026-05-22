import { Test, TestingModule } from '@nestjs/testing';
import { ModelTrainingService } from './model-training.service';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import type { LayersModel } from '@tensorflow/tfjs-layers';
import type { Tensor2D } from '@tensorflow/tfjs-core';

describe('ModelTrainingService', () => {
  let service: ModelTrainingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModelTrainingService, TfjsNodeService],
    }).compile();

    service = module.get(ModelTrainingService);
  });

  it('deve ser instanciado corretamente', () => {
    expect(service).toBeDefined();
  });

  describe('createModel()', () => {
    it('deve retornar um LayersModel compilado', () => {
      const model = service.createModel(1, 4);

      expect(model).toBeDefined();
      expect(typeof model.fit).toBe('function');
      expect(typeof model.predict).toBe('function');
    });

    it('deve aceitar as dims corretas (userDim=1, movieDim=4)', () => {
      expect(() => service.createModel(1, 4)).not.toThrow();
    });

    it('deve criar camada user_input com shape [userDim]', () => {
      const model = service.createModel(3, 4);

      const layer = model.getLayer('user_input');
      expect(layer).toBeDefined();
      expect(layer.batchInputShape).toEqual([null, 3]);
    });

    it('deve criar camada movie_input com shape [movieDim]', () => {
      const model = service.createModel(1, 6);

      const layer = model.getLayer('movie_input');
      expect(layer).toBeDefined();
      expect(layer.batchInputShape).toEqual([null, 6]);
    });

    it('deve criar camada user_embedding', () => {
      const model = service.createModel(1, 4);

      expect(() => model.getLayer('user_embedding')).not.toThrow();
    });

    it('deve criar camada movie_embedding', () => {
      const model = service.createModel(1, 4);

      expect(() => model.getLayer('movie_embedding')).not.toThrow();
    });

    it('deve ter 2 inputs e 1 output', () => {
      const model = service.createModel(1, 4);

      expect(model.inputs).toHaveLength(2);
      expect(model.outputs).toHaveLength(1);
    });

    it('output deve ter shape [null, 1] — score de afinidade', () => {
      const model = service.createModel(1, 4);

      expect(model.outputShape).toEqual([null, 1]);
    });
  });

  describe('trainModel()', () => {
    let model: LayersModel;

    beforeEach(() => {
      model = service.createModel(1, 4);
    });

    it('deve treinar sem lançar erro com dados válidos', async () => {
      const tfjsNode = await import('@tensorflow/tfjs-node');
      const tf = tfjsNode.default ?? tfjsNode;

      const n = 4;
      const userTensor = tf.tensor2d([[0.1], [0.9], [0.3], [0.7]], [n, 1]);
      const movieTensor = tf.tensor2d(
        [
          [0.5, 0, 0.8, 0],
          [0.2, 1, 0.6, 1],
          [0.9, 0, 0.3, 0],
          [0.4, 0, 0.7, 2],
        ],
        [n, 4],
      );
      const labels = tf.tensor2d([[1], [1], [0], [0]], [n, 1]);

      await expect(
        service.trainModel(model, userTensor, movieTensor, labels),
      ).resolves.not.toThrow();
    });

    it('deve liberar os tensors após o treino', async () => {
      const tfjsNode = await import('@tensorflow/tfjs-node');
      const tf = tfjsNode.default ?? tfjsNode;

      const n = 4;
      const userTensor = tf.tensor2d([[0.1], [0.9], [0.3], [0.7]], [n, 1]);
      const movieTensor = tf.tensor2d(
        [
          [0.5, 0, 0.8, 0],
          [0.2, 1, 0.6, 1],
          [0.9, 0, 0.3, 0],
          [0.4, 0, 0.7, 2],
        ],
        [n, 4],
      );
      const labels = tf.tensor2d([[1], [1], [0], [0]], [n, 1]);

      // TF marca tensor como disposed após dispose() — isDisposed não é público,
      // mas uma segunda chamada a .data() lança erro após dispose.
      await service.trainModel(model, userTensor, movieTensor, labels);

      expect(() => userTensor.dataSync()).toThrow();
      expect(() => movieTensor.dataSync()).toThrow();
      expect(() => labels.dataSync()).toThrow();
    });
  });

  describe('extractEncoders()', () => {
    it('deve retornar userEncoder e movieEncoder como modelos distintos', () => {
      const model = service.createModel(1, 4);

      const { userEncoder, movieEncoder } = service.extractEncoders(model);

      expect(userEncoder).toBeDefined();
      expect(movieEncoder).toBeDefined();
      expect(userEncoder).not.toBe(movieEncoder);
    });

    it('userEncoder deve aceitar input de shape [userDim] e produzir embedding de 32d', async () => {
      const tfjsNode = await import('@tensorflow/tfjs-node');
      const tf = tfjsNode.default ?? tfjsNode;

      const model = service.createModel(1, 4);
      const { userEncoder } = service.extractEncoders(model);

      const input = tf.tensor2d([[0.5]], [1, 1]);
      const output = userEncoder.predict(input) as Tensor2D;

      expect(output.shape).toEqual([1, 32]);
      input.dispose();
      output.dispose();
    });

    it('movieEncoder deve aceitar input de shape [movieDim] e produzir embedding de 32d', async () => {
      const tfjsNode = await import('@tensorflow/tfjs-node');
      const tf = tfjsNode.default ?? tfjsNode;

      const model = service.createModel(1, 4);
      const { movieEncoder } = service.extractEncoders(model);

      const input = tf.tensor2d([[0.5, 0, 0.8, 1]], [1, 4]);
      const output = movieEncoder.predict(input) as Tensor2D;

      expect(output.shape).toEqual([1, 32]);
      input.dispose();
      output.dispose();
    });

    it('userEncoder e movieEncoder devem ter 1 input e 1 output cada', () => {
      const model = service.createModel(1, 4);

      const { userEncoder, movieEncoder } = service.extractEncoders(model);

      expect(userEncoder.inputs).toHaveLength(1);
      expect(userEncoder.outputs).toHaveLength(1);
      expect(movieEncoder.inputs).toHaveLength(1);
      expect(movieEncoder.outputs).toHaveLength(1);
    });
  });
});
