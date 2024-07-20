/*
 * File: PipelineLoader.module.ts                                              *
 * Project: pg-judger                                                          *
 * Created Date: Sa Jul 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Sat Jul 20 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */
import { Module } from '@nestjs/common'
import { SimpleJudgePipelineProvider } from './common/simple-judge.pipeline'
import { SimpleCompilePipelineProvider } from './common/simple-compile.pipeline'
import { ExecModule } from '@/modules/exec/exec.module'
import { CompareModule } from '@/modules/compare/compare.module'

@Module({
  imports: [ExecModule, CompareModule],
  providers: [SimpleCompilePipelineProvider, SimpleJudgePipelineProvider]
})
export class DynamicPipelineModule {}
