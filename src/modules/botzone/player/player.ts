/*
 * File: player.ts                                                             *
 * Project: pg-judger                                                          *
 * Created Date: Fr Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Sun Jun 09 2024                                              *
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

export type PlayerID = string
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
    this.exec.write('\n')
    console.log('write', req)
    const resp_str = await this.exec.readLine('stdout')
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

export class GuessNumberSinglePlayer implements IPlayer {
  id = '114514'

  left = 0
  right = 20000

  move(req: {
    hint: 'smaller' | 'larger' | 'begin'
  }): Promise<SerializableObject> {
    console.log(req)
    if (req.hint === 'begin') {
      console.log(`begin`)
      return Promise.resolve({
        guess: (this.left + this.right) / 2
      })
    }

    if (req.hint === 'smaller') {
      this.right = (this.left + this.right) / 2
    } else {
      this.left = (this.left + this.right) / 2
    }
    console.log(this.left, this.right, `guessed: ${(this.left + this.right) / 2}`)
    return Promise.resolve({
      guess: Math.floor((this.left + this.right) / 2)
    })
  }
}