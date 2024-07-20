import { Module } from '@nestjs/common'
import { CompileService } from './compile.service'
// import { CommonPipelineProvider } from '../../pipelines/common/common'
import { ExecModule } from '../exec/exec.module'
import { JailModule } from '../jail/jail.module'
import { MeterModule } from '../meter/meter.module'
import { PipelineModule } from '../pipeline/pipeline.module'
import { CompareModule } from '../compare/compare.module'

@Module({
  imports: [ExecModule, JailModule, MeterModule, PipelineModule, CompareModule],
  providers: [CompileService],
  exports: [CompileService]
})
export class CompileModule {}
