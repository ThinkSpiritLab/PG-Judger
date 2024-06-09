/*
 * File: game.ts                                                               *
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
      while (
        !(await this.gamerule.checkGameShallEnd(
          Array.from(this.playerMap.values())
        )) &&
        move_count < max_move_count
      ) {
        const next_player_id = await this.gamerule.getNextPlayerId()
        const next_player = this.playerMap.get(next_player_id)!
        const move = await next_player.move(
          await this.gamerule.createQuery(next_player_id)
        )
        this.gamerule.onPlayerMoveReceived(next_player, move)
        console.log('move', move)
        await this.gamerule.validatePlayerMove(next_player, move)
        await this.gamerule.applyPlayerMove(next_player, move)

        move_count++

        // console.log('move', move_count)
      }
    } catch (e) {
      if (e instanceof GameEndException) {
        console.log('game end')
        return await this.gamerule.onGameSettled()
      }
    }
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
