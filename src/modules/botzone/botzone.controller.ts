import { Body, Controller, Post } from '@nestjs/common';
import { CreateBotzoneDto } from './dto/create-botzone.dto';

@Controller('botzone')
export class BotzoneController {
  @Post('create')
  async create(@Body() createBotzoneDto: CreateBotzoneDto) {
    return 114514
  }
}
