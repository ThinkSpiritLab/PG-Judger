/*
 * File: common.ts                                                                *
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
import { writeFile, rm, open } from 'fs/promises'
import { TMP_DIR_PREFIX } from '../constant'
import {
  MeterResult,
  MeterService,
  MeterSpawnOption
} from '@/modules/meter/meter.service'
import { JailSpawnOption, LegacyJailService } from '../../jail/jail.legacy'
import { ConfigService } from '@nestjs/config'
import { RegisterPipeline } from '@/modules/pipeline/pipeline.decorator'
import { TestCase, TestPolicy } from '@/modules/judge/judge.service'
import { CompareService } from '../../compare/compare.service'
import { RuntimeError } from '@/modules/pipeline/pipeline.exception'
import { JudgeRuntimeError } from '@/modules/judge/judge.exceptions'

export type CommonCompileOption = {
  skip: boolean
  compilerExec: string
  compilerArgs: string[]
  jailOption: JailSpawnOption //TODO remove legacy option
  meterOption: Omit<MeterSpawnOption, 'meterFd'> //TODO remove legacy option
  sourceName: string
  targetName: string
  tempDir?: string
  targetPath?: string
}

export type CommonCompileStore = {
  source: string
  targetPath: string
  exit_code: number
  measure: MeterResult
  tempDir: string
}

export type CommonJudgeOption = {
  jailOption: JailSpawnOption //TODO remove legacy option
  meterOption: Omit<MeterSpawnOption, 'meterFd'> //TODO remove legacy option

  case: TestCase
}

export type CommonJudgeStore = {
  targetPath: string
  tempDir: string
  user_exit_code?: number
  user_measure?: MeterResult
}

//TODO move this to an invidual module
@Injectable()
export class CommonPipelineProvider {
  constructor(
    private readonly execService: ExecService,
    private readonly legacyMeterService: MeterService,
    private readonly legacyJailService: LegacyJailService,
    private readonly configService: ConfigService,
    private readonly compareService: CompareService
  ) {}

  @RegisterPipeline('common-compile')
  commonCompilePipelineFactory(option: CommonCompileOption) {
    return Pipeline.create<CommonCompileStore>(({ pipe, ctx }) => {
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

            console.log(`compile measure: ${JSON.stringify(measure)}`)

            ctx.store.exit_code = exit_code
            ctx.store.measure = measure!
            ctx.store.targetPath = option.targetPath
            ctx.store.tempDir = option.tempDir!
          },
          { name: 'compile-jailed' }
        )
        .catch(T.unlink(option.tempDir!))
    })
  }

  @RegisterPipeline('common-run-testcase')
  // note that this only test a single testcase
  commonJudgePipelineFactory(option: CommonJudgeOption) {
    return Pipeline.create<CommonJudgeStore>(({ pipe, ctx }) => {
      return pipe(
        async () => {
          if (!ctx.store.tempDir) {
            throw new Error('tempDir is not set')
          }

          const caseInputPath = join(ctx.store.tempDir, 'case-input')
          const caseOutputPath = join(ctx.store.tempDir, 'case-output')
          const userOutputPath = join(ctx.store.tempDir, 'user-output')

          await Promise.all([
            writeFile(caseInputPath, option.case.input),
            writeFile(caseOutputPath, option.case.output),
            writeFile(userOutputPath, '')
          ])

          return { caseInputPath, caseOutputPath, userOutputPath }
        },
        { name: 'prep-files' }
      )
        .pipe(
          async ({ caseInputPath, caseOutputPath, userOutputPath }) => {
            const [caseInputFD, userOutputFD] = await Promise.all([
              open(caseInputPath, 'r'),
              open(userOutputPath, 'w')
            ])

            try {
              const task = await this.execService.runWithJailAndMeterFasade({
                command: ctx.store.targetPath!,
                args: [],
                memory_kb: option.meterOption.memoryLimit || 1024 * 128, //TODO remove magic numbers
                timeout_ms: option.meterOption.timeLimit || 2000,
                stdio: [caseInputFD.fd, userOutputFD.fd, 'pipe', 'pipe'],
                cwd: ctx.store.tempDir,
                bindMount: [{ source: ctx.store.tempDir, mode: 'rw' }]
              })

              task.start()

              const [_, measure] = await Promise.all([
                task.getExitAwaiter(),
                task.measure
              ])

              if (!measure) {
                throw new RuntimeError('measure failed')
              }

              if (measure.returnCode !== 0) {
                throw new RuntimeError('user program failed')
              }

              ctx.store.user_exit_code = measure.returnCode
              ctx.store.user_measure = measure

              console.log(`user_exit_code: ${measure?.returnCode}`)
              console.log(`user_measure: ${JSON.stringify(measure)}`)
            } catch (error) {
              throw error
            } finally {
              await Promise.all([caseInputFD.close(), userOutputFD.close()])
            }
            return { caseOutputPath, userOutputPath }
          },
          { name: 'run-user' }
        )
        .pipe(
          async ({ caseOutputPath, userOutputPath }) => {
            const result = await this.compareService.compare(caseOutputPath, userOutputPath, 'normal')

            if (result === 'PE') {
              throw new JudgeRuntimeError("presentation-error", "PE")
            } else if (result === 'WA') {
              throw new JudgeRuntimeError("wrong-answer", "WA")
            }

            console.log(`compare result: ${result}`)
          },
          { name: 'compare' }
        )
    })
  }
}
