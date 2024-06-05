/*
 * File: judge.exceptions.ts                                                   *
 * Project: pg-judger                                                          *
 * Created Date: Su Jun 2024                                                   *
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

import { JudgeErrorType } from './judge.decl'

export class JudgeException extends Error {
  constructor(
    public reason: JudgeErrorType,
    message: string
  ) {
    super(message)
  }
}

