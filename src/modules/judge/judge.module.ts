import { Module } from '@nestjs/common'
import { JudgeService } from './judge.service'
import { CompileModule } from '../compile/compile.module'
import { PipelineModule } from '../pipeline/pipeline.module'

@Module({
  imports: [CompileModule, PipelineModule],
  providers: [JudgeService]
})
export class JudgeModule {}
