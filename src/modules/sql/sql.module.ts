import { Module } from '@nestjs/common';
import { SqlService } from './sql.service';

@Module({
  providers: [SqlService]
})
export class SqlModule {}
