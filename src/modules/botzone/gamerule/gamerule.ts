import { Player } from '../player/player';
/*
 * File: gamerule.ts                                                           *
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



export class GameRule {

  ctx: any

  // 获取游戏人数、等元数据
  getMeta() {
    return {
      //TODO
    }
  }

  onGameStart() {
    //TODO
  }

  onPlayerMove() {
    //TODO
  }

  checkPlayerCanJoin(player: Player) {
    //TODO
  }

  checkGameCanStart() {
    //TODO
  }

  checkGameShallEnd() {

  }


}