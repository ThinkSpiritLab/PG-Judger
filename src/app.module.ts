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
import { CompileModule } from './modules/compile/compile.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';
import { JailModule } from './modules/jail/jail.module';
import { SqlModule } from './modules/sql/sql.module';
import { BotzoneModule } from './modules/botzone/botzone.module';
import { JudgeModule } from './modules/judge/judge.module';
import { ExecModule } from './modules/exec/exec.module';

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
    CompileModule,
    PipelineModule,
    JailModule,
    SqlModule,
    BotzoneModule,
    JudgeModule,
    ExecModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
