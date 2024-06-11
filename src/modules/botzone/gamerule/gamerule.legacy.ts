/*
 * File: gamerule.legacy.ts                                                    *
 * Project: pg-judger                                                          *
 * Created Date: Tu Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Tue Jun 11 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { MeteredExecuable } from '@/modules/exec/executable'
import {
  GameruleRequest,
  GameruleResponce,
  GameruleResponceSchema
} from '../decl'
import { deserialize, serialize } from '../serialize'
import { timed } from '@/utils/async'

type LegacyGameruleLimit = {
  initTimeLimit: number
  timeLimit: number
  memoryLimit: number
}

export interface ILegacyGamerule {
  send(req: GameruleRequest): Promise<GameruleResponce>
}

class LegacyGamerule implements ILegacyGamerule {
  exec: MeteredExecuable
  limit: LegacyGameruleLimit

  async send(req: GameruleRequest): Promise<GameruleResponce> {
    this.exec.write(serialize(req) + '\n')

    const [ret, time_used] = await timed(
      () => this.exec.readLine('stdout'),
      this.limit.timeLimit
    )

    return GameruleResponceSchema.parse(deserialize(ret)) as GameruleResponce //TODO: fix type
  }
}
