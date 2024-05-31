import { Module } from '@nestjs/common';
import { JailService } from './jail.service';
import { LegacyJailService } from './jail.legacy';

@Module({
  providers: [JailService, LegacyJailService],
  exports: [JailService, LegacyJailService],
})
export class JailModule {}
