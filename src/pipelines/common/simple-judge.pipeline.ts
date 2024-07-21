import { ExecutableInfo, TestCase } from '@/modules/judge/judge.service'
import { TestPolicy } from '../../modules/judge/judge.service'
import { RegisterPipeline } from '@/modules/pipeline/pipeline.decorator'
import { ExecService } from '@/modules/exec/exec.service'
import {
  CompareResult,
  CompareService
} from '@/modules/compare/compare.service'
import { Injectable } from '@nestjs/common'
import { Pipeline } from '@/modules/pipeline/pipeline'
import { Object } from 'ts-toolbelt'
import { JailSpawnOption } from '@/modules/jail/jail.legacy'
import {
  MeterResult,
  MeterSpawnOption,
  testMeterOrThrow
} from '@/modules/meter/meter.service'
import { join } from 'path'
import { open, writeFile } from 'fs/promises'
import { PipelineRuntimeError } from '@/modules/pipeline/pipeline.exception'
import { JudgeException } from '@/modules/judge/judge.exceptions'

/*
 * File: simple-judge.ts                                                       *
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

type SimpleJudgeOption = Object.Readonly<{}>

type SimpleJudgeStore = {
  case: TestCase
  tempDir: string
  user: ExecutableInfo
  user_exit_code: number
  user_measure: MeterResult
  result: CompareResult
}

@Injectable()
export class SimpleJudgePipelineProvider {
  constructor(
    private readonly execService: ExecService,
    private readonly compareService: CompareService
  ) {}

  // note that this only test a single testcase
  @RegisterPipeline('simple-run-testcase')
  simpleJudgePipelineFactory(option: SimpleJudgeOption) {
    return Pipeline.create<SimpleJudgeStore>(({ pipe, ctx: { store: s } }) => {
      return pipe(
        async () => {
          if (!s.tempDir) {
            throw new Error('tempDir is unset')
          }

          const caseInputPath = join(s.tempDir, 'case-input')
          const caseOutputPath = join(s.tempDir, 'case-output')
          const userOutputPath = join(s.tempDir, 'user-output')

          await Promise.all([
            writeFile(caseInputPath, s.case.input),
            writeFile(caseOutputPath, s.case.output),
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
              const task = this.execService.createJailAndMeterFasadeTask({
                command: `${s.tempDir}/target`,
                memory_MB: s.user.limit.runtime.memory,
                timeout_ms: s.user.limit.runtime.memory,
                stdio: [caseInputFD.fd, userOutputFD.fd, 'ignore', 'ignore'],
                cwd: s.tempDir,
                bindMount: [{ source: s.tempDir, mode: 'rw' }]
              })

              task.start()

              const [_, measure] = await Promise.all([
                task.getExitAwaiter(),
                task.measure
              ])

              console.log(`user_measure: ${JSON.stringify(measure)}`)

              if (!measure) {
                console.warn('measure is not set')
                throw new PipelineRuntimeError(
                  'measure failed',
                  'runtime-error'
                )
              }

              if (measure.returnCode !== 0) {
                testMeterOrThrow(measure, {
                  cpuTime: s.user.limit.runtime.cpuTime!,
                  memory: s.user.limit.runtime.memory!
                })

                throw new PipelineRuntimeError(
                  'user program failed',
                  'runtime-error'
                )
              }

              s.user_exit_code = measure.returnCode
              s.user_measure = measure
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

            s.result = result
          },
          { name: 'compare' }
        )
    })
  }
}
