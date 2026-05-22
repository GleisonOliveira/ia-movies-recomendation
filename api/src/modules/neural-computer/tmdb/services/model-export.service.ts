import { Injectable, Logger } from '@nestjs/common';
import type { LayersModel } from '@tensorflow/tfjs-layers';
import { mkdir } from 'fs/promises';

@Injectable()
export class ModelExportService {
  private readonly logger = new Logger(ModelExportService.name);

  async saveModel(model: LayersModel, path: string): Promise<void> {
    await mkdir(path, { recursive: true });
    await model.save(`file://${path}`);
    this.logger.log(`Model saved to ${path}`);
  }
}
