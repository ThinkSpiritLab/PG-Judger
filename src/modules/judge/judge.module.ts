import { Module } from '@nestjs/common'
import { JudgeService } from './judge.service'
import { CompileModule } from '../compile/compile.module'
import { PipelineModule } from '../pipeline/pipeline.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [CompileModule, PipelineModule, ConfigModule],
  providers: [JudgeService]
})
export class JudgeModule {}
