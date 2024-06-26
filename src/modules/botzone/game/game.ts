/*
 * File: game.ts                                                               *
 * Project: pg-judger                                                          *
 * Created Date: Fr Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Mon Jun 10 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import { EventEmitter } from 'node:events'
import { IPlayer } from '../player/player'
import { GameEndException, GameRule } from '../gamerule/gamerule'

export class Game extends EventEmitter {
  playerMap: Map<string, IPlayer> = new Map()

  constructor(private gamerule: GameRule) {
    super()
    const controller = new GameController(this)
    gamerule.gameController = controller
  }

  async start() {
    if (
      !(await this.gamerule.checkGameCanStart(
        Array.from(this.playerMap.values())
      ))
    ) {
      throw new Error('Game cannot start')
    }

    this.gamerule.onGameStart()
    let move_count = 0
    const max_move_count = 25
    try {
      while (await this.gameCanContinue(move_count, max_move_count)) {
        const next_player_id = await this.gamerule.getNextPlayerId()
        const next_player = this.playerMap.get(next_player_id)!
        const move = await next_player.move( //TODO add timeout
          await this.gamerule.createQuery(next_player_id)
        )
        await this.gamerule.onPlayerMoveReceived(next_player, move)
        console.log('move', move)
        await this.gamerule.validatePlayerMove(next_player, move)
        await this.gamerule.applyPlayerMove(next_player, move)

        move_count++

        // console.log('move', move_count)
      }
    } catch (e) {
      if (e instanceof GameEndException) {
        console.log('game end due to GameEndException')
        return await this.gamerule.onGameSettled()
      }
      throw e
    }
    console.log('game end due to move count limit')
  }

  private async gameCanContinue(
    move_count: number,
    max_move_count: number
  ) {
    const ret = (
      move_count < max_move_count &&
      !(await this.gamerule.checkGameShallEnd(
        Array.from(this.playerMap.values())
      ))
    )
    return ret
  }

  addPlayer(player: IPlayer) {
    this.playerMap.set(player.id, player)
  }

  removePlayer(player: IPlayer) {
    this.playerMap.delete(player.id)
  }

  getPlayer(playerID: string) {
    return this.playerMap.get(playerID)
  }
}

export class GameController {
  constructor(private readonly game: Game) {}

  getPlayers() {
    return this.game.playerMap.values()
  }
}
