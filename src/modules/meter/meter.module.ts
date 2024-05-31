import { Module } from '@nestjs/common'
import { LegacyMeterService } from './meter.service'

@Module({
  providers: [LegacyMeterService],
  exports: [LegacyMeterService]
})
export class MeterModule {}
