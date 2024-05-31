import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JailService {
  constructor(
    configService: ConfigService
  ) {
    // check nsjail path
    const path = configService.get<string>("NSJAIL_PATH")
    // TODO
  }
}
