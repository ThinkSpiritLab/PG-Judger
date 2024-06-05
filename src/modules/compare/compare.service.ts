/*
 * File: compare.service.ts                                                    *
 * Project: pg-judger                                                          *
 * Created Date: Sa Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Wed Jun 05 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FileHandle, open } from 'fs/promises'
import { JailService } from '../jail/jail.service'
import { LegacyJailService } from '../jail/jail.legacy'
import Executable, { MeteredExecuable } from '../exec/executable'
import { ExecService } from '../exec/exec.service'
import { range } from 'lodash'
import { PipelineRuntimeError } from '../pipeline/pipeline.exception'

type CompareMode = 'float' | 'normal' | 'strict'
export type CompareResult = typeof compareResultMap[keyof typeof compareResultMap]
const compareResultMap = {
  AC: 'accepted',
  WA: 'wrong-answer',
  PE: 'presentation-error'
} as const
@Injectable()
export class CompareService {
  ojcmpPath: string

  limits: {
    memory_MB: number
    timeout_ms: number
  } = {
    memory_MB: 1024,
    timeout_ms: 3000
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly execService: ExecService
  ) {
    this.ojcmpPath = this.configService.getOrThrow<string>('OJ_CMP_PATH')
  }

  async test() {
    return await this.compare('/tmp/a', '/tmp/b', 'normal')
  }

  async compare(a: string, b: string, mode: CompareMode) {
    let cmp: MeteredExecuable | null = null
    let aFH: FileHandle | null = null
    let bFH: FileHandle | null = null

    try {
      aFH = await open(a, 'r+')
      bFH = await open(b, 'r+')

      cmp = await this.execService.runWithJailAndMeterFasade({
        command: this.ojcmpPath,
        args: [mode, '--user-fd', '0', '--std-fd', '3'],
        memory_MB: this.limits.memory_MB,
        timeout_ms: this.limits.timeout_ms,
        stdio: [aFH.fd, 'pipe', 'pipe', bFH.fd]
      })

      cmp.start()

      const [meter, judgeResult] = await Promise.all([
        cmp.measure,
        cmp.rdStdout()
      ])

      if (!judgeResult) {
        throw new PipelineRuntimeError('no output from compare', 'runtime-error') //FIXME not a pipeline error
      }

      // console.log(`compare measure: ${JSON.stringify(meter)}`)

      return compareResultMap[judgeResult.trim() as 'AC' | 'WA' | 'PE'] 
    } catch (error) {
      throw error
    } finally {
      cmp?.process?.kill()
      aFH?.close()
      bFH?.close()
    }
  }
}
