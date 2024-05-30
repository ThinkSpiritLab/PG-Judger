/*
 * File: app.module.ts                                                         *
 * Project: pg-judger                                                          *
 * Created Date: Th May 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Thu May 30 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validate } from './misc/env.validation';
import { PipelineService } from './modules/pipeline/pipeline.service';

const env_file_path = process.env.NODE_ENV === 'production' ? 
  ['.env.production', '.env'] :
  ['.env.development', '.env'];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: env_file_path,
      isGlobal: true,
      validate, // schema see /src/misc/env.validation.ts
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PipelineService],
})
export class AppModule {}
