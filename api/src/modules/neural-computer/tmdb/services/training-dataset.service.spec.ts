import { Test, TestingModule } from '@nestjs/testing';
import { TrainingDatasetService } from './training-dataset.service';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';
import type {
  MovieTensorFeatures,
  UserTensorFeatures,
} from '../../services/types';

const movieFeature = (id: number): MovieTensorFeatures => ({
  movie_id: id,
  popularity: 0.5,
  adult: 0,
  vote_average: 0.8,
  original_language_index: 0,
});

const userFeature = (id: number): UserTensorFeatures => ({
  user_id: id,
  age: 0.5,
});

describe('TrainingDatasetService', () => {
  let service: TrainingDatasetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingDatasetService, TfjsNodeService],
    }).compile();

    service = module.get(TrainingDatasetService);
  });

  it('deve ser instanciado corretamente', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar tensors com shape [0, dim] quando não há exemplos válidos', () => {
    const result = service.buildTrainingDataset(
      [{ user_id: 99, movie_id: 99 }],
      new Map(),
      new Map(),
    );

    expect(result.userTensor.shape[0]).toBe(0);
    expect(result.movieTensor.shape[0]).toBe(0);
    expect(result.labelsTensor.shape[0]).toBe(0);

    result.userTensor.dispose();
    result.movieTensor.dispose();
    result.labelsTensor.dispose();
  });

  it('deve retornar userDim=0 e movieDim=0 quando não há exemplos válidos', () => {
    const { userDim, movieDim, userTensor, movieTensor, labelsTensor } =
      service.buildTrainingDataset(
        [{ user_id: 1, movie_id: 10 }],
        new Map(),
        new Map(),
      );

    expect(userDim).toBe(0);
    expect(movieDim).toBe(0);

    userTensor.dispose();
    movieTensor.dispose();
    labelsTensor.dispose();
  });

  it('deve gerar 1 exemplo positivo por interação válida', () => {
    // movie1 é o único filme — sem candidato negativo
    const userFeaturesMap = new Map([[1, userFeature(1)]]);
    const movieFeaturesMap = new Map([[10, movieFeature(10)]]);

    const { userTensor, movieTensor, labelsTensor } =
      service.buildTrainingDataset(
        [{ user_id: 1, movie_id: 10 }],
        userFeaturesMap,
        movieFeaturesMap,
      );

    expect(userTensor.shape).toEqual([1, 1]);
    expect(movieTensor.shape).toEqual([1, 4]);
    expect(labelsTensor.shape).toEqual([1, 1]);

    // label deve ser 1 (positivo)
    expect(Array.from(labelsTensor.dataSync())).toEqual([1]);

    userTensor.dispose();
    movieTensor.dispose();
    labelsTensor.dispose();
  });

  it('deve gerar 1 amostra negativa para cada positiva quando há filme não assistido', () => {
    const userFeaturesMap = new Map([[1, userFeature(1)]]);
    const movieFeaturesMap = new Map([
      [10, movieFeature(10)],
      [20, movieFeature(20)],
    ]);

    const { userTensor, labelsTensor } = service.buildTrainingDataset(
      [{ user_id: 1, movie_id: 10 }],
      userFeaturesMap,
      movieFeaturesMap,
    );

    // 1 positivo + 1 negativo
    expect(userTensor.shape[0]).toBe(2);

    const labels = Array.from(labelsTensor.dataSync());
    expect(labels).toContain(1);
    expect(labels).toContain(0);

    userTensor.dispose();
    labelsTensor.dispose();
  });

  it('não deve gerar negativo quando usuário assistiu todos os filmes', () => {
    const userFeaturesMap = new Map([[1, userFeature(1)]]);
    const movieFeaturesMap = new Map([[10, movieFeature(10)]]);

    const { userTensor, labelsTensor } = service.buildTrainingDataset(
      [{ user_id: 1, movie_id: 10 }],
      userFeaturesMap,
      movieFeaturesMap,
    );

    expect(userTensor.shape[0]).toBe(1);
    expect(Array.from(labelsTensor.dataSync())).toEqual([1]);

    userTensor.dispose();
    labelsTensor.dispose();
  });

  it('deve ignorar interação cujo user não está no featuresMap', () => {
    const userFeaturesMap = new Map([[1, userFeature(1)]]);
    const movieFeaturesMap = new Map([[10, movieFeature(10)]]);

    const { userTensor, movieTensor, labelsTensor } =
      service.buildTrainingDataset(
        [{ user_id: 99, movie_id: 10 }],
        userFeaturesMap,
        movieFeaturesMap,
      );

    expect(userTensor.shape[0]).toBe(0);

    userTensor.dispose();
    movieTensor.dispose();
    labelsTensor.dispose();
  });

  it('deve ignorar interação cujo movie não está no featuresMap', () => {
    const userFeaturesMap = new Map([[1, userFeature(1)]]);
    const movieFeaturesMap = new Map([[10, movieFeature(10)]]);

    const { userTensor, movieTensor, labelsTensor } =
      service.buildTrainingDataset(
        [{ user_id: 1, movie_id: 99 }],
        userFeaturesMap,
        movieFeaturesMap,
      );

    expect(userTensor.shape[0]).toBe(0);

    userTensor.dispose();
    movieTensor.dispose();
    labelsTensor.dispose();
  });

  it('deve retornar userDim=1 e movieDim=4', () => {
    const userFeaturesMap = new Map([[1, userFeature(1)]]);
    const movieFeaturesMap = new Map([
      [10, movieFeature(10)],
      [20, movieFeature(20)],
    ]);

    const { userDim, movieDim, userTensor, movieTensor, labelsTensor } =
      service.buildTrainingDataset(
        [{ user_id: 1, movie_id: 10 }],
        userFeaturesMap,
        movieFeaturesMap,
      );

    expect(userDim).toBe(1);
    expect(movieDim).toBe(4);

    userTensor.dispose();
    movieTensor.dispose();
    labelsTensor.dispose();
  });

  it('deve criar labelsTensor com shape [n, 1]', () => {
    const userFeaturesMap = new Map([[1, userFeature(1)]]);
    const movieFeaturesMap = new Map([
      [10, movieFeature(10)],
      [20, movieFeature(20)],
    ]);

    const { labelsTensor } = service.buildTrainingDataset(
      [{ user_id: 1, movie_id: 10 }],
      userFeaturesMap,
      movieFeaturesMap,
    );

    expect(labelsTensor.shape[1]).toBe(1);

    labelsTensor.dispose();
  });

  it('deve retornar Tensor2D reais com dataSync funcional', () => {
    const userFeaturesMap = new Map([[1, userFeature(1)]]);
    const movieFeaturesMap = new Map([[10, movieFeature(10)]]);

    const { userTensor, movieTensor, labelsTensor } =
      service.buildTrainingDataset(
        [{ user_id: 1, movie_id: 10 }],
        userFeaturesMap,
        movieFeaturesMap,
      );

    expect(() => userTensor.dataSync()).not.toThrow();
    expect(() => movieTensor.dataSync()).not.toThrow();
    expect(() => labelsTensor.dataSync()).not.toThrow();

    userTensor.dispose();
    movieTensor.dispose();
    labelsTensor.dispose();
  });
});
