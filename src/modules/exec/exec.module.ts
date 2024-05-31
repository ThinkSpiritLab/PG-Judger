import { Module } from '@nestjs/common';
import { ExecService } from './exec.service';

@Module({
  providers: [ExecService]
})
export class ExecModule {}
