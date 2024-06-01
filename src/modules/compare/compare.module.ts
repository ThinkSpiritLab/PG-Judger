import { Module } from '@nestjs/common'
import { CompareService } from './compare.service'
import { JailModule } from '../jail/jail.module'
import { ExecModule } from '../exec/exec.module'

@Module({
  imports: [JailModule, ExecModule],
  providers: [CompareService]
})
export class CompareModule {}
