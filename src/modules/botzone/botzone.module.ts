import { Module } from '@nestjs/common';
import { BotzoneService } from './botzone.service';
import { ExecModule } from '../exec/exec.module';

@Module({
  imports: [ExecModule],
  providers: [BotzoneService],
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