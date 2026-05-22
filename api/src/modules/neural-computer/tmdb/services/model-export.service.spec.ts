import { Test, TestingModule } from '@nestjs/testing';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { ModelExportService } from './model-export.service';

// Cria modelo TF mínimo válido para persistência — evita dependência de fixture externo.
// Usa a mesma API funcional do ModelTrainingService para garantir compatibilidade.
async function buildMinimalModel() {
  const tfjsNode = await import('@tensorflow/tfjs-node');
  const tf = tfjsNode.default ?? tfjsNode;

  const input = tf.input({ shape: [1], name: 'input' });
  const output = tf.layers
    .dense({ units: 1, activation: 'sigmoid' })
    .apply(input);
  const model = tf.model({
    inputs: input,
    outputs: output as ReturnType<typeof tf.input>,
  });
  return model;
}

describe('ModelExportService', () => {
  let service: ModelExportService;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `model-export-test-${Date.now()}`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [ModelExportService],
    }).compile();

    service = module.get(ModelExportService);
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('deve ser instanciado corretamente', () => {
    expect(service).toBeDefined();
  });

  it('deve criar o diretório e salvar model.json no path recebido', async () => {
    const model = await buildMinimalModel();
    const savePath = path.join(tmpDir, 'full');

    await service.saveModel(model, savePath);

    expect(fs.existsSync(path.join(savePath, 'model.json'))).toBe(true);
  });

  it('deve criar diretório inexistente de forma recursiva', async () => {
    const model = await buildMinimalModel();
    const deepPath = path.join(tmpDir, 'a', 'b', 'c');

    await service.saveModel(model, deepPath);

    expect(fs.existsSync(deepPath)).toBe(true);
  });

  it('deve salvar weights.bin junto com model.json', async () => {
    const model = await buildMinimalModel();
    const savePath = path.join(tmpDir, 'encoder');

    await service.saveModel(model, savePath);

    expect(fs.existsSync(path.join(savePath, 'weights.bin'))).toBe(true);
  });

  it('deve aceitar qualquer path sem conhecer nomes de camadas', async () => {
    const model = await buildMinimalModel();
    const paths = ['full', 'user-encoder', 'movie-encoder'].map((p) =>
      path.join(tmpDir, p),
    );

    for (const p of paths) {
      await service.saveModel(model, p);
      expect(fs.existsSync(path.join(p, 'model.json'))).toBe(true);
    }
  });

  it('deve sobrescrever modelo existente sem lançar erro', async () => {
    const model = await buildMinimalModel();
    const savePath = path.join(tmpDir, 'full');

    await service.saveModel(model, savePath);
    await expect(service.saveModel(model, savePath)).resolves.not.toThrow();
  });
});
