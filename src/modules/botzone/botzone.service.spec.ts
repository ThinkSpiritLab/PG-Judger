import { Test, TestingModule } from '@nestjs/testing';
import { BotzoneService } from './botzone.service';

describe('BotzoneService', () => {
  let service: BotzoneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BotzoneService],
    }).compile();

    service = module.get<BotzoneService>(BotzoneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
