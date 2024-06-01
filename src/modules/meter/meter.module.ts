import { Module } from '@nestjs/common'
import { MeterService } from './meter.service'

@Module({
  providers: [MeterService],
  exports: [MeterService]
})
export class MeterModule {}
