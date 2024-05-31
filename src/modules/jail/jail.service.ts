import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { NsJail } from './jail.driver';
import { merge } from 'lodash';

const logger = new Logger('JailService');

const defaultJailConfig = {
  time: 1000,
  memory: 256,
};

@Injectable()
export class JailService {
  constructor(configService: ConfigService) {
    // check nsjail path
    const path = configService.get<string>('NSJAIL_PATH');

    if (!path) {
      logger.error('nsjail path is not set');
      return;
    }

    if (!existsSync(path)) {
      throw new Error('nsjail path does not exist');
    } else {
      logger.log(`nsjail path is set to ${path}`);
    }
  }

  async create({
    executable,
    args,
    cfg,
  }: {
    executable: string;
    args: string[];
    cfg: Partial<typeof defaultJailConfig>;
  }) {
    const c = merge(defaultJailConfig, cfg);

    const jail = NsJail.asDangling()
      .setCommand(executable)
      .setArgs(args)
      .time_limit(c.time)
      .MemLimit(c.memory);

    return jail.getCommand();
  }
}
