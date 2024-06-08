import EventEmitter from 'node:events'
import { IPlayer, LocalPlayer } from '../player/player'
import { MeteredExecuable } from '@/modules/exec/executable'
import { exec } from 'child_process'
import { SerializableObject } from '../serialize'
import { PlayerID } from '../../../../../BP-Judger/src/game/players/IPlayer';
import { GameController } from '../game/game'
/*
 * File: gamerule.ts                                                           *
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

type GameMeta = {
  name: string
  playerMinCount: number
  playerMaxCount: number
}

export interface GameRule {
  gameController: GameController

  getMeta(): GameMeta

  onGameStart(): void

  checkPlayerCanJoin(player: IPlayer): boolean

  checkGameCanStart(players: IPlayer[]): boolean

  checkGameShallEnd(players: IPlayer[]): boolean

  requestPlayerMove(player: IPlayer): PlayerID

  validatePlayerMove(player: IPlayer, move: SerializableObject): boolean
  onPlayerMoveReceived(player: IPlayer, move: SerializableObject): SerializableObject
  onPlayerMoveTimeout(player: IPlayer, move: SerializableObject): void

  applyPlayerMove(player: IPlayer, move: SerializableObject): void
}

export abstract class LocalGamerule extends EventEmitter implements GameRule {
  id: string
  exec: MeteredExecuable
  gameController: GameController

  constructor(id: string, exec: MeteredExecuable, gameController: GameController) {
    super()

    this.id = id
    this.exec = exec
    this.gameController = gameController
  }

  getMeta(): GameMeta {
    return {
      name: 'local',
      playerMinCount: 1,
      playerMaxCount: 1
    }
  }

  onGameStart() {}

  onPlayerMove() {}

  checkPlayerCanJoin(player: IPlayer): boolean {
    return true
  }

  checkGameCanStart(): boolean {
    return true
  }

  checkGameShallEnd(): boolean {
    return false
  }

  requestPlayerMove(player: IPlayer): PlayerID {
    throw new Error('Method not implemented.')
  }

  onPlayerMoveReceived(player: IPlayer): SerializableObject {
    throw new Error('Method not implemented.')
  }

  onPlayerMoveTimeout(player: IPlayer): void {}

  validatePlayerMove(player: IPlayer): boolean {
    return true
  }

  applyPlayerMove(player: IPlayer): void {}
}

export class GuessNumberSingleGamerule
  extends EventEmitter
  implements GameRule
{
  ctx: Record<string, any> = {}
  gameController: GameController

  getMeta(): GameMeta {
    return {
      name: 'guess-number',
      playerMinCount: 1,
      playerMaxCount: 1
    }
  }

  onGameStart(): void {
    this.ctx.target = Math.floor(Math.random() * 100)
    this.ctx.history = []
  }

  checkPlayerCanJoin(player: IPlayer): boolean {
    return true
  }
  checkGameCanStart(players: IPlayer[]): boolean {
    return players.length === 1
  }
  checkGameShallEnd(players: IPlayer[]): boolean {
    // NOT USED, we throw an exception instead
    return false
  }
  requestPlayerMove(): PlayerID {
    return this.gameController.getPlayers().next().value.id
  }
  onPlayerMoveReceived(player: IPlayer, move: SerializableObject): SerializableObject {
    const guess = move.guess
    if (guess === this.ctx.target) {
      throw new GameEndException()
    } else if (guess < this.ctx.target) {
      return {
        hint: 'larger'
      }
    } else {
      return {
        hint: 'smaller'
      }
    }
  }
  onPlayerMoveTimeout(player: IPlayer, move: SerializableObject): void {
    throw new Error('Method not implemented.')
  }
  validatePlayerMove(player: IPlayer, move: SerializableObject): boolean {
    return true //TODO validate
  }
  applyPlayerMove(player: IPlayer, move: SerializableObject): void {
    this.ctx.history.push({
      by: player.id,
      move
    })
  }
}

class GameEndException extends Error {
  constructor() {
    super('Game end')
  }
}
