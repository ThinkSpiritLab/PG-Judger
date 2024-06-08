/*
 * File: player.ts                                                             *
 * Project: pg-judger                                                          *
 * Created Date: Fr Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Sat Jun 08 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { EventEmitter } from 'node:events';
import { SerializableObject, serialize, tryDeserialize, trySerialize } from "../serialize";
import { MeteredExecuable } from "@/modules/exec/executable";

type PlayerID = string
type PlayerMoveRequest = SerializableObject
type PlayerMoveResponse = SerializableObject

export type PlayerMove = {
  by: PlayerID
  move: SerializableObject
}

export interface IPlayer {
  id: PlayerID
  move(req: PlayerMoveRequest): Promise<PlayerMoveResponse>
}

export class LocalPlayer extends EventEmitter implements IPlayer {
  id: string;
  exec: MeteredExecuable

  constructor(id: string, exec: MeteredExecuable) {
    super()
    this.id = id
    this.exec = exec
  }

  async move(req: PlayerMoveRequest): Promise<SerializableObject> {
    this.exec.write(serialize(req))
    const resp_str = await this.exec.read('stdout')
    if (!resp_str) {
      throw new PlayerInvalidMoveError()
    } //TODO add timeout

    const [resp, success] = tryDeserialize(resp_str)

    if (!success) {
      throw new PlayerInvalidMoveError()
    }

    return resp
  }

  async moveRaw(req: string): Promise<string> {
    this.exec.write(req)
    const resp = await this.exec.readLine('stdout')

    if (!resp) {
      throw new PlayerInvalidMoveError()
    } //TODO add timeout

    return resp
  }
}

class PlayerInvalidMoveError extends Error {
  constructor() {
    super('Invalid move')
  }
}