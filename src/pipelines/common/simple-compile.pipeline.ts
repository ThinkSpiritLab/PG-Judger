/*
 * File: simple-compile.ts                                                     *
 * Project: pg-judger                                                          *
 * Created Date: Sa Jul 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Sun Jul 21 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { searchLangConfigByExecInfoOrThrow } from '@/lang'
import { ExecService } from '@/modules/exec/exec.service'
import { JailSpawnOption } from '@/modules/jail/jail.legacy'
import { ExecutableInfo } from '@/modules/judge/judge.service'
import {
  MeterResult,
  MeterSpawnOption,
  testMeterOrThrow
} from '@/modules/meter/meter.service'
import { Pipeline } from '@/modules/pipeline/pipeline'
import { RegisterPipeline } from '@/modules/pipeline/pipeline.decorator'
import { Injectable } from '@nestjs/common'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { Object } from 'ts-toolbelt'

export type SimpleCompileOption = Object.Readonly<{}>

export type SimpleCompileStore = {
  source: ExecutableInfo
  tempDir: string

  // jailOption: JailSpawnOption //TODO remove legacy option
  // meterOption: Omit<MeterSpawnOption, 'meterFd'> //TODO remove legacy option
  // sourceName: string
  // targetName: string
  targetPath: string
  exit_code: number
  measure: MeterResult
}

@Injectable()
export class SimpleCompilePipelineProvider {
  constructor(private readonly execService: ExecService) {}

  @RegisterPipeline('simple-compile')
  simpleCompilePipelineFactory(option: SimpleCompileOption) {
    return Pipeline.create<SimpleCompileStore>(({ pipe, ctx: { store } }) => {
      return pipe(() => {
        return store.tempDir
      })
        .pipe(
          async (path) => {
            const file = join(path, 'source.cc')
            await writeFile(file, store.source.src.content)
            store.tempDir = path
            return file
          },
          { name: 'write-source-file' }
        )
        .pipe(
          async (srcPath) => {
            store.targetPath = join(store.tempDir!, 'target')
            const lang = searchLangConfigByExecInfoOrThrow(store.source)
            const task = this.execService.createJailAndMeterFasadeTask({
              command: lang.configs.compile.compilerExec,
              args: [
                ...lang.configs.compile.compilerArgs,
                srcPath,
                '-o',
                store.targetPath
              ],
              memory_MB: store.source.limit.compiler.memory,
              timeout_ms: store.source.limit.compiler.cpuTime * 1024,
              bindMount: [{ source: store.tempDir!, mode: 'rw' }],
              cwd: store.tempDir!
            })

            task.start()

            const [exit_code, measure] = await Promise.all([
              task.getExitAwaiter(),
              task.measure!
            ])

            if (measure.returnCode !== 0) {
              // throw new JudgeCompileError('compile failed')
              testMeterOrThrow(measure, {
                cpuTime: store.source.limit.compiler.cpuTime,
                memory: store.source.limit.compiler.memory
              })
            }

            store.exit_code = exit_code
            store.measure = measure!
            store.tempDir = store.tempDir!
          },
          { name: 'compile-jailed' }
        )
    })
  }
}
