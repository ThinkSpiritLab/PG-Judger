/*
 * File: index.ts                                                              *
 * Project: pg-judger                                                          *
 * Created Date: Mo Jun 2024                                                   *
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

import { bomb } from "./bomb";
import { c } from "./c";
import { cpp } from "./cpp";

export const tests = {
  cpp,
  c,
  bomb
} as const
