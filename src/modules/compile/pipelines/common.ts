/*
 * File: common.ts                                                                *
 * Project: pg-judger                                                          *
 * Created Date: Fr May 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Fri Jun 07 2024                                              *
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
import { Object } from 'ts-toolbelt'

export type CommonCompileOption = Object.Readonly<{
  skip: boolean
  compilerExec: string
  compilerArgs: string[]
  jailOption: JailSpawnOption //TODO remove legacy option
  meterOption: Omit<MeterSpawnOption, 'meterFd'> //TODO remove legacy option
  sourceName: string
  targetName: string
}>

export type CommonCompileStore = {
  source: string //TODO split prerun and runtime variables
  tempDir: string

  targetPath: string
  exit_code: number
  measure: MeterResult
}
export type CommonJudgeOption = Object.Readonly<{
  jailOption: JailSpawnOption //TODO remove legacy option
  meterOption: Omit<MeterSpawnOption, 'meterFd'> //TODO remove legacy option
}>

export type CommonJudgeStore = {
  targetPath: string
  case: TestCase
  tempDir: string
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
    private readonly compareService: CompareService
  ) {}

  @RegisterPipeline('common-compile')
  commonCompilePipelineFactory(option: CommonCompileOption) {
    return Pipeline.create<CommonCompileStore>(({ pipe, ctx }) => {
      return pipe(() => ctx.store.tempDir)
        .pipe(
          async (path) => {
            const file = join(path, option.sourceName)
            await writeFile(file, ctx.store.source)
            ctx.store.tempDir = path
            return file
          },
          { name: 'write-source-file' }
        )
        .pipe(
          async (srcPath) => {
            ctx.store.targetPath = join(ctx.store.tempDir!, option.targetName)

            const task = await this.execService.runWithJailAndMeterFasade({
              command: option.compilerExec,
              args: [...option.compilerArgs, srcPath, '-o', ctx.store.targetPath],
              memory_MB: option.meterOption.memoryLimit! / 8 / 1024 / 1024,
              timeout_ms: option.meterOption.timeLimit!,
              bindMount: [{ source: ctx.store.tempDir!, mode: 'rw' }],
              cwd: ctx.store.tempDir!
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
            ctx.store.tempDir = ctx.store.tempDir!
          },
          { name: 'compile-jailed' }
        )
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
                stdio: [caseInputFD.fd, userOutputFD.fd, 'ignore', 'ignore'],
                cwd: ctx.store.tempDir,
                bindMount: [{ source: ctx.store.tempDir, mode: 'rw' }]
              })

              task.start()

              const [_, measure] = await Promise.all([
                task.getExitAwaiter(),
                task.measure
              ])

              if (!measure) {
                console.warn('measure is not set')
                throw new PipelineRuntimeError(
                  'measure failed',
                  'runtime-error'
                )
              }

              if (measure.returnCode !== 0) {
                // console.warn('user program failed')

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
