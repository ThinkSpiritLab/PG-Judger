/*
 * File: index.ts                                                              *
 * Project: pg-judger                                                          *
 * Created Date: Mo Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Tue Jun 04 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

import AC from './cpp/AC'
import CE from './cpp/CE'
import MLE from './cpp/MLE'
import RE from './cpp/RE'
import TLE from './cpp/TLE'
import TLE2 from './cpp/TLE2'
import WA from './cpp/WA'

export const tests = {
  cpp: [AC, CE, MLE, RE, TLE, TLE2, WA]
} as const
