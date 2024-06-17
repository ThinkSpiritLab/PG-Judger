import { Module } from '@nestjs/common';
import { BotzoneService } from './botzone.service';
import { ExecModule } from '../exec/exec.module';
import { BotzoneController } from './botzone.controller';

@Module({
  imports: [ExecModule],
  providers: [BotzoneService],
  controllers: [BotzoneController],
})
export class BotzoneModule {}
/**
 * compile bots, and judger program
 * 
 * Set up room
 * 
 * run and measure
 * 
 * end room
 * 
 */