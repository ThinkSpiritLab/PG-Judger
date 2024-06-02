/*
 * File: compare.service.ts                                                    *
 * Project: pg-judger                                                          *
 * Created Date: Sa Jun 2024                                                   *
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

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FileHandle, open } from 'fs/promises'
import { JailService } from '../jail/jail.service'
import { LegacyJailService } from '../jail/jail.legacy'
import Executable, { MeteredExecuable } from '../exec/executable'
import { ExecService } from '../exec/exec.service';
import { range } from 'lodash'

type CompareMode = 'float' | 'normal' | 'strict'

@Injectable()
export class CompareService {
  ojcmpPath: string
  constructor(
    private readonly configService: ConfigService,
    private readonly jailService: JailService,
    private readonly legacyJailService: LegacyJailService,
    private readonly execService: ExecService
  ) {
    this.ojcmpPath = this.configService.getOrThrow<string>('OJ_CMP_PATH')

    // this.test()
    //   .then((res) => {
    //     console.log('done', res)
    //   })
    //   .catch((e) => {
    //     console.error(e)
    //   })
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
        memory_kb: 1024 * 1024 * 256,
        timeout_ms: 100000,
        stdio: [aFH.fd, 'pipe', 'pipe', bFH.fd],
      })

      cmp.start()

      const [
        meter,
        judgeResult
      ] = await Promise.all([cmp.measure, cmp.rdStdout()])

      console.log('meter:', meter, 'judgeResult:', judgeResult)

      if (!meter || !judgeResult) {
        throw new Error('Missing output from compare')
      }

      return judgeResult.trim() as 'AC' | 'WA' | "PE"
    } catch (error) {
      throw error
    } finally {
      cmp?.process?.kill()
      aFH?.close()
      bFH?.close()
    }
  }


}
