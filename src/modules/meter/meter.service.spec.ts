import { Test, TestingModule } from '@nestjs/testing';
import { LegacyMeterService } from './meter.service';

describe('MeterService', () => {
  let service: LegacyMeterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegacyMeterService],
    }).compile();

    service = module.get<LegacyMeterService>(LegacyMeterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
