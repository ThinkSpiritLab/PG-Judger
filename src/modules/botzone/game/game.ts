/*
 * File: game.ts                                                               *
 * Project: pg-judger                                                          *
 * Created Date: Fr Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Fri Jun 07 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import EventEmitter from 'events'
import { Player } from '../player/player'
import { GameRule } from '../gamerule/gamerule'

export class Game extends EventEmitter {
  playerMap: Map<string, Player> = new Map()

  constructor(gamerule: GameRule) {
    super()
  }
}
