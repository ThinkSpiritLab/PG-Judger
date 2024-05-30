import { Test, TestingModule } from '@nestjs/testing';
import { JailService } from './jail.service';

describe('JailService', () => {
  let service: JailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JailService],
    }).compile();

    service = module.get<JailService>(JailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
