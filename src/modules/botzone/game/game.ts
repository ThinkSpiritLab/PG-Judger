/*
 * File: game.ts                                                               *
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
import { LocalPlayer } from '../player/player'
import { GameRule } from '../gamerule/gamerule'

export class Game extends EventEmitter {
  playerMap: Map<string, LocalPlayer> = new Map()

  constructor(gamerule: GameRule) {
    super()
  }
}


export class GameController {
  constructor(
    private readonly game: Game,
  ) {}

  getPlayers() {
    return this.game.playerMap.values()
  }
  
}