import { Injectable } from '@nestjs/common';
import * as tfjsNode from '@tensorflow/tfjs-node';

@Injectable()
export class TfjsNodeService {
  public readonly tf = tfjsNode;
}
