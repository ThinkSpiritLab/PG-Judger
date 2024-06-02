/*
 * File: g++.ts                                                                *
 * Project: pg-judger                                                          *
 * Created Date: Fr May 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Sun Jun 02 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { Pipeline } from '@/modules/pipeline/pipeline'
import { T } from './utils'
import { Injectable } from '@nestjs/common'
import { ExecService } from '@/modules/exec/exec.service'
import { join } from 'path'
import { tmpdir } from 'os'
import { writeFile, rm } from 'fs/promises'
import { TMP_DIR_PREFIX } from '../constant'
import { MeterService, MeterSpawnOption } from '@/modules/meter/meter.service'
import { JailSpawnOption, LegacyJailService } from '../../jail/jail.legacy'
import { ConfigService } from '@nestjs/config'
import { RegisterPipeline } from '@/modules/pipeline/pipeline.decorator'

export type CommonCompileOption = {
  skip: boolean
  compilerExec: string
  compilerArgs: string[]
  jailOption: JailSpawnOption
  meterOption: Omit<MeterSpawnOption, 'meterFd'>
  sourceName: string
  targetName: string
  tempDir?: string
  targetPath?: string
}

export type CommonCompileStore = {
  source: string
}

@Injectable()
export class SimpleCompileProvider {
  constructor(
    private readonly execService: ExecService,
    private readonly legacyMeterService: MeterService,
    private readonly legacyJailService: LegacyJailService,
    private readonly configService: ConfigService
  ) {}

  @RegisterPipeline('common-compile')
  commonCompilePipelineFactory(option: CommonCompileOption) {
    // create a pipeline that accepts CommonCompileEnv, and when runned successfully, output the compiled file path
    const p = Pipeline.create(({ pipe, ctx }) => {
      return pipe(T.mkdtemp(join(tmpdir(), TMP_DIR_PREFIX)), {
        name: 'create-temp-dir'
      })
        .pipe(
          async (path) => {
            const file = join(path, option.sourceName)
            await writeFile(file, ctx.store.source)
            option.tempDir = path
            return file
          },
          { name: 'write-source-file' }
        )
        .pipe(
          async (srcPath) => {
            option.targetPath = join(option.tempDir!, option.targetName)

            const task = await this.execService.runWithJailAndMeterFasade({
              command: option.compilerExec,
              args: [...option.compilerArgs, srcPath, '-o', option.targetPath],
              memory_kb: option.meterOption.memoryLimit || 1024 * 128, //TODO remove magic numbers
              timeout_ms: option.meterOption.timeLimit || 2000,
              bindMount: [{ source: option.tempDir!, mode: 'rw' }],
              cwd: option.tempDir!
            })

            // task.on('stdout', (data) => console.log(`stdout: ${data}`))
            // task.on('stderr', (data) => console.log(`stderr: ${data}`))
            // task.on('close', (code) => console.log(`close: ${code}`))
            // task.on('error', (err) => console.error(`error: ${err}`))

            task.start()

            const [exit_code, measure] = await Promise.all([
              task.getExitAwaiter(),
              task.measure
            ])

            ctx.store['exit_code'] = exit_code
            ctx.store['measure'] = measure
          },
          { name: 'compile-jailed' }
        )
    })

    return p
  }
}
