import { Injectable, Logger } from '@nestjs/common';
import type { LayersModel } from '@tensorflow/tfjs-layers';
import type { Logs } from '@tensorflow/tfjs-layers/dist/logs';
import type { Tensor2D } from '@tensorflow/tfjs-core';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';

@Injectable()
export class ModelTrainingService {
  private readonly logger = new Logger(ModelTrainingService.name);

  constructor(private readonly tfjsNodeService: TfjsNodeService) {}

  // Arquitetura two-tower: duas redes independentes que projetam usuários e filmes
  // no mesmo espaço vetorial. Permite pré-computar embeddings de filmes offline
  // e usar busca vetorial (ANN) em vez de rodar o modelo para cada par.
  createModel(userDim: number, movieDim: number): LayersModel {
    const { tf } = this.tfjsNodeService;

    // 32 dimensões suficientes para padrões de afinidade com as features atuais.
    const EMBEDDING_DIM = 32;

    const userInput = tf.input({ shape: [userDim], name: 'user_input' });
    const userHidden = tf.layers
      .dense({ units: 64, activation: 'relu' })
      .apply(userInput);
    // Ativação linear: dot product e sigmoid já introduzem não-linearidade necessária.
    const userEmbedding = tf.layers
      .dense({
        units: EMBEDDING_DIM,
        activation: 'linear',
        name: 'user_embedding',
      })
      .apply(userHidden) as ReturnType<typeof tf.input>;

    const movieInput = tf.input({ shape: [movieDim], name: 'movie_input' });
    const movieHidden = tf.layers
      .dense({ units: 64, activation: 'relu' })
      .apply(movieInput);
    const movieEmbedding = tf.layers
      .dense({
        units: EMBEDDING_DIM,
        activation: 'linear',
        name: 'movie_embedding',
      })
      .apply(movieHidden) as ReturnType<typeof tf.input>;

    // normalize: true → cosine similarity em [-1, 1].
    const dot = tf.layers
      .dot({ axes: 1, normalize: true })
      .apply([userEmbedding, movieEmbedding]);

    // Sigmoid projeta para [0, 1] — compatível com binaryCrossentropy.
    const output = tf.layers
      .dense({ units: 1, activation: 'sigmoid' })
      .apply(dot);

    const model = tf.model({
      inputs: [userInput, movieInput],
      outputs: output as ReturnType<typeof tf.input>,
    });

    // Adam lr=0.001: estável para two-tower; lr maior tende a divergir
    // porque gradiente flui por dois caminhos independentes.
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  // Extrai as duas torres como sub-modelos independentes do modelo completo treinado.
  // user-encoder: user_input → user_embedding (inferência em tempo real)
  // movie-encoder: movie_input → movie_embedding (pré-computado offline no Neo4j)
  extractEncoders(model: LayersModel): {
    userEncoder: LayersModel;
    movieEncoder: LayersModel;
  } {
    const { tf } = this.tfjsNodeService;

    const userEncoder = tf.model({
      inputs: model.getLayer('user_input').output as ReturnType<
        typeof tf.input
      >,
      outputs: model.getLayer('user_embedding').output as ReturnType<
        typeof tf.input
      >,
    });

    const movieEncoder = tf.model({
      inputs: model.getLayer('movie_input').output as ReturnType<
        typeof tf.input
      >,
      outputs: model.getLayer('movie_embedding').output as ReturnType<
        typeof tf.input
      >,
    });

    return { userEncoder, movieEncoder };
  }

  async trainModel(
    model: LayersModel,
    userFeatures: Tensor2D,
    movieFeatures: Tensor2D,
    labels: Tensor2D,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      model
        .fit([userFeatures, movieFeatures], labels, {
          epochs: 10,
          // batchSize 32: equilibra estabilidade do gradiente e uso de memória.
          batchSize: 32,
          // 20% dos dados reservados para validação — detecta overfitting.
          validationSplit: 0.2,
          callbacks: {
            onEpochEnd: (epoch: number, logs?: Logs) => {
              this.logger.log(
                `Epoch ${epoch + 1}: loss = ${logs?.['loss']?.toFixed(4)}, acc = ${logs?.['acc']?.toFixed(4)}`,
              );
            },
          },
        })
        .then(() => {
          // Libera tensors da GPU/WASM — GC do JS não gerencia tensors do TensorFlow.
          userFeatures.dispose();
          movieFeatures.dispose();
          labels.dispose();
          resolve();
        })
        .catch((err: Error) => reject(err));
    });
  }
}
