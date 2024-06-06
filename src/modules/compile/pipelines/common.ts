/*
 * File: common.ts                                                                *
 * Project: pg-judger                                                          *
 * Created Date: Fr May 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Thu Jun 06 2024                                              *
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
import { writeFile, rm, open, readFile } from 'fs/promises'
import { TMP_DIR_PREFIX } from '../constant'
import {
  MeterResult,
  MeterService,
  MeterSpawnOption,
  testMeterOrThrow
} from '@/modules/meter/meter.service'
import { JailSpawnOption, LegacyJailService } from '../../jail/jail.legacy'
import { ConfigService } from '@nestjs/config'
import { RegisterPipeline } from '@/modules/pipeline/pipeline.decorator'
import { TestCase, TestPolicy } from '@/modules/judge/judge.service'
import { CompareResult, CompareService } from '../../compare/compare.service'
import { PipelineRuntimeError } from '@/modules/pipeline/pipeline.exception'
import { JudgeException } from '@/modules/judge/judge.exceptions'

export type CommonCompileOption = {
  skip: boolean
  compilerExec: string
  compilerArgs: string[]
  jailOption: JailSpawnOption //TODO remove legacy option
  meterOption: Omit<MeterSpawnOption, 'meterFd'> //TODO remove legacy option
  sourceName: string
  targetName: string
  tempDir: string
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
}

export type CommonJudgeStore = {
  targetPath: string
  tempDir: string
  case: TestCase

  // set in runtime
  user_exit_code?: number
  result?: CompareResult
  user_measure?: MeterResult
}

//TODO move this to an invidual module
@Injectable()
export class CommonPipelineProvider {
  constructor(
    private readonly execService: ExecService,
    // private readonly legacyMeterService: MeterService,
    // private readonly legacyJailService: LegacyJailService,
    // private readonly configService: ConfigService,
    private readonly compareService: CompareService
  ) {}

  @RegisterPipeline('common-compile')
  commonCompilePipelineFactory(option: CommonCompileOption) {
    return Pipeline.create<CommonCompileStore>(({ pipe, ctx }) => {
      // return pipe(T.mkdtemp(join(tmpdir(), TMP_DIR_PREFIX)), { //TODO 将TMPDIR 创建/删除的控制权交给上层处理
      //   name: 'create-temp-dir'
      // })

      return pipe(() => option.tempDir)
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
              memory_MB: option.meterOption.memoryLimit! / 8 / 1024 / 1024,
              timeout_ms: option.meterOption.timeLimit!,
              bindMount: [{ source: option.tempDir!, mode: 'rw' }],
              cwd: option.tempDir!
            })

            task.start()

            const [exit_code, measure] = await Promise.all([
              task.getExitAwaiter(),
              task.measure!
            ])

            console.log(`compile measure: ${JSON.stringify(measure)}`)

            if (measure.returnCode !== 0) {
              // throw new JudgeCompileError('compile failed')
              testMeterOrThrow(measure, {
                cpuTime: option.meterOption.timeLimit!,
                memory: option.meterOption.memoryLimit!
              })
            }

            ctx.store.exit_code = exit_code
            ctx.store.measure = measure!
            ctx.store.targetPath = option.targetPath
            ctx.store.tempDir = option.tempDir!
          },
          { name: 'compile-jailed' }
        )
        .catch(async () => {
          if (ctx.store.tempDir) {
            await rm(ctx.store.tempDir, { recursive: true })
          }
        })
    })
  }

  // note that this only test a single testcase
  @RegisterPipeline('common-run-testcase')
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
            writeFile(caseInputPath, ctx.store.case.input),
            writeFile(caseOutputPath, ctx.store.case.output),
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
                memory_MB: option.meterOption.memoryLimit || 1024, //TODO remove magic numbers
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
                throw new PipelineRuntimeError(
                  'measure failed',
                  'runtime-error'
                )
              }

              if (measure.returnCode !== 0) {
                // throw new LimitViolationError(`user program failed, exit code: ${measure.returnCode}`, measure)
                testMeterOrThrow(measure, {
                  cpuTime: option.meterOption.timeLimit!,
                  memory: option.meterOption.memoryLimit!
                })

                throw new PipelineRuntimeError(
                  'user program failed',
                  'runtime-error'
                )
              }

              ctx.store.user_exit_code = measure.returnCode
              ctx.store.user_measure = measure

              // console.log(`user_exit_code: ${measure?.returnCode}`)
              // console.log(`user_measure: ${JSON.stringify(measure)}`)
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
            const result = await this.compareService.compare(
              caseOutputPath,
              userOutputPath,
              'normal'
            )
            // log users output
            if (result === 'presentation-error') {
              throw new JudgeException(
                'presentation-error',
                'presentation-error'
              )
            } else if (result === 'wrong-answer') {
              throw new JudgeException('wrong-answer', 'wrong-answer')
            }

            ctx.store.result = result
          },
          { name: 'compare' }
        )
    })
  }
}
