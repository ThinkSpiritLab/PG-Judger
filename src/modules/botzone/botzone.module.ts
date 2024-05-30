import { Module } from '@nestjs/common';
import { BotzoneService } from './botzone.service';

@Module({
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