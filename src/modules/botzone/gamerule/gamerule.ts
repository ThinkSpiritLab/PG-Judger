import { MeteredExecuable } from '@/modules/exec/executable'
import { EventEmitter } from 'node:events'
import { GameController } from '../game/game'
import { IPlayer, LocalPlayer, PlayerID } from '../player/player'
import { SerializableObject } from '../serialize'
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

  checkPlayerCanJoin(player: IPlayer): Promise<boolean>

  checkGameCanStart(players: IPlayer[]): Promise<boolean>

  checkGameShallEnd(players: IPlayer[]): Promise<boolean>

  getNextPlayerId(): Promise<PlayerID>

  createQuery(player: PlayerID): Promise<SerializableObject>

  validatePlayerMove(
    player: IPlayer,
    move: SerializableObject
  ): Promise<boolean>
  onPlayerMoveReceived(player: IPlayer, move: SerializableObject): Promise<void>
  onPlayerMoveTimeout(player: IPlayer, move: SerializableObject): void

  applyPlayerMove(player: IPlayer, move: SerializableObject): void
}

export abstract class LocalGamerule extends EventEmitter implements GameRule {
  id: string
  exec: MeteredExecuable
  gameController: GameController
  winner: IPlayer

  constructor(
    id: string,
    exec: MeteredExecuable,
    gameController: GameController
  ) {
    super()

    this.id = id
    this.exec = exec
    this.gameController = gameController
  }
  createQuery(player: string): Promise<SerializableObject> {
    throw new Error('Method not implemented.')
  }
  onGameStart(): void {
    throw new Error('Method not implemented.')
  }

  getMeta(): GameMeta {
    return {
      name: 'local',
      playerMinCount: 1,
      playerMaxCount: 1
    }
  }

  onGameStarts() {}

  onPlayerMove() {}

  async checkPlayerCanJoin(player: IPlayer) {
    return true
  }

  async checkGameCanStart() {
    return true
  }

  async checkGameShallEnd() {
    return this.winner !== undefined
  }

  async getNextPlayerId() {
    return this.gameController.getPlayers().next().value.id as PlayerID
  }

  async onPlayerMoveReceived(player: IPlayer): Promise<void> {
    throw new Error('Method not implemented.')
  }

  onPlayerMoveTimeout(player: IPlayer): void {}

  async validatePlayerMove(player: IPlayer) {
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

  onGameStart() {
    this.ctx.target = Math.floor(Math.random() * 100)
    this.ctx.history = []
    this.ctx.last_guess = new Map()

    console.log('target', this.ctx.target)
  }

  async checkPlayerCanJoin(player: IPlayer) {
    return true
  }
  async checkGameCanStart(players: IPlayer[]) {
    return players.length === 1
  }
  async checkGameShallEnd(players: IPlayer[]) {
    // NOT USED, we throw an exception instead
    return false
  }
  async getNextPlayerId(): Promise<PlayerID> {
    return this.gameController.getPlayers().next().value.id
  }
  async onPlayerMoveReceived(player: IPlayer, move: SerializableObject) {
    const { guess } = move as { guess: number }
    this.ctx.last_guess.set(player.id, guess)
  }
  async onPlayerMoveTimeout(player: IPlayer, move: SerializableObject) {
    throw new Error('Method not implemented.')
  }
  async validatePlayerMove(player: IPlayer, move: SerializableObject) {
    return true //TODO validate
  }
  async applyPlayerMove(player: IPlayer, move: SerializableObject) {
    this.ctx.history.push({
      by: player.id,
      move
    })
  }

  async createQuery(player: string): Promise<SerializableObject> {
    if (this.ctx.last_guess.has(player)) {
      if (this.ctx.last_guess.get(player) === this.ctx.target) {
        throw new GameEndException()
      } else if (this.ctx.last_guess.get(player) < this.ctx.target) {
        return { hint: 'larger' }
      } else {
        return { hint: 'smaller' }
      }
    } else {
      return { hint: 'begin' }
    }
  }
}

export class GameEndException extends Error {
  constructor() {
    super('Game end')
  }
}
