import { Module } from '@nestjs/common';
import { CompileService } from './compile.service';

@Module({
  providers: [CompileService],
})
export class CompileModule {}
