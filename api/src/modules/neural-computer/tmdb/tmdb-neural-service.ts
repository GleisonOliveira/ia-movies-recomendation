import { Injectable } from '@nestjs/common';
import { NeuralComputerInterface } from '../../../interfaces/neural-computer/neural-computer-interface';
import { TfjsNodeService } from '@/modules/tensorflow/tfjs-node.service';

@Injectable()
export class TmdbNeuralService implements NeuralComputerInterface {
  constructor(private readonly tfjsNodeService: TfjsNodeService) {}

  async train(data: any): Promise<void> {
    void data;
    void this.tfjsNodeService.tf;
  }
}
