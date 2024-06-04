/*
 * File: app.module.ts                                                         *
 * Project: pg-judger                                                          *
 * Created Date: Th May 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Tue Jun 04 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CompileModule } from './modules/compile/compile.module'
import { PipelineModule } from './modules/pipeline/pipeline.module'
import { JailModule } from './modules/jail/jail.module'
import { SqlModule } from './modules/sql/sql.module'
import { BotzoneModule } from './modules/botzone/botzone.module'
import { JudgeModule } from './modules/judge/judge.module'
import { ExecModule } from './modules/exec/exec.module'
import { MeterModule } from './modules/meter/meter.module'
import { CompareModule } from './modules/compare/compare.module'
import { CommonModule } from './modules/common/common.module'

@Module({
  imports: [
    CommonModule,
    CompileModule,
    PipelineModule,
    JailModule,
    SqlModule,
    BotzoneModule,
    JudgeModule,
    ExecModule,
    MeterModule,
    CompareModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
