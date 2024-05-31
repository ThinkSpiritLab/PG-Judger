import { Module } from '@nestjs/common'
import { CompileService } from './compile.service'
import { CppCompileProvider } from './pipelines/g++'
import { ExecModule } from '../exec/exec.module'

@Module({
  imports: [ExecModule],
  providers: [CompileService, CppCompileProvider]
})
export class CompileModule {}
