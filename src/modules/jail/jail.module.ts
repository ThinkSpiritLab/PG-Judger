import { Module } from '@nestjs/common';
import { JailService } from './jail.service';

@Module({
  providers: [JailService]
})
export class JailModule {}
