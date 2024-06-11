/*
 * File: plauer.legacy.ts                                                      *
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
import { PlayerMoveRequest, PlayerMoveResponce, PlayerMoveResponceSchema } from '../decl'
import { deserialize, serialize } from '../serialize'

interface ILagacyPlayer {
  send(req: PlayerMoveRequest): Promise<PlayerMoveResponce>
}

class LegacyPlayer implements ILagacyPlayer {
  exec: MeteredExecuable

  async send(req: PlayerMoveRequest): Promise<PlayerMoveResponce> {
    this.exec.write(serialize(req) + '\n')
    
    const ret = await this.exec.readLine('stdout')

    return PlayerMoveResponceSchema.parse(deserialize(ret))
  }
}
