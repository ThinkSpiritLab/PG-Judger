/*
 * File: index.ts                                                              *
 * Project: pg-judger                                                          *
 * Created Date: We Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Wed Jun 05 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import bull from './bull'
import cole from './cole'
import ctle from './ctle'
import forkBomb from './fork-bomb'
import killTimer from './kill-timer'
import stack from './stack'

export const bomb = [stack, killTimer, forkBomb, ctle, cole, bull]
