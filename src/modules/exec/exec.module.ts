import { Module } from '@nestjs/common'
import { ExecService } from './exec.service'
import { JailModule } from '../jail/jail.module'
import { MeterModule } from '../meter/meter.module'

@Module({
  imports: [JailModule, MeterModule],
  providers: [ExecService],
  exports: [ExecService]
})
export class ExecModule {}
