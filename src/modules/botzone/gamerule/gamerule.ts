import { LocalPlayer } from '../player/player'
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
  getMeta(): GameMeta

  onGameStart(): void

  onPlayerMove(): void

  checkPlayerCanJoin(player: LocalPlayer): boolean

  checkGameCanStart(): boolean

  checkGameShallEnd(): boolean

  requestPlayerMove(player: LocalPlayer): void

  onPlayerMoveReceived(player: LocalPlayer): void
  onPlayerMoveTimeout(player: LocalPlayer): void

  validatePlayerMove(player: LocalPlayer): boolean
  applyPlayerMove(player: LocalPlayer): void
}
