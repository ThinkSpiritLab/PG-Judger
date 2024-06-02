import { Module } from '@nestjs/common'
import { CompileService } from './compile.service'
import { SimpleCompileProvider } from './pipelines/g++'
import { ExecModule } from '../exec/exec.module'
import { JailModule } from '../jail/jail.module'
import { MeterModule } from '../meter/meter.module'
import { PipelineModule } from '../pipeline/pipeline.module'

@Module({
  imports: [ExecModule, JailModule, MeterModule, PipelineModule],
  providers: [CompileService, SimpleCompileProvider]
})
export class CompileModule {}
