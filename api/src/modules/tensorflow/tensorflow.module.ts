import { Module } from '@nestjs/common';
import { TfjsNodeService } from './tfjs-node.service';

@Module({
  providers: [TfjsNodeService],
  exports: [TfjsNodeService],
})
export class TensorflowModule {}

