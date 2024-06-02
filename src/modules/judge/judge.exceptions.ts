/*
 * File: judge.exceptions.ts                                                   *
 * Project: pg-judger                                                          *
 * Created Date: Su Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Sun Jun 02 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

class BaseException extends Error {
  constructor(message: string) {
    super(message)
  }
}

class JudgeException extends BaseException {
  constructor(message: string) {
    super(message)
  }
}

export type JudgeErrorReason =
  | 'time-limit-exceeded'
  | 'memory-limit-exceeded'
  | 'output-limit-exceeded'
  | 'runtime-error'
  | 'compile-error'
  | 'wrong-answer'
  | 'judge-error'
  | 'presentation-error'
export enum JudgeResultKind {
  Accepted = 'Accepted',
  WrongAnswer = 'WrongAnswer',
  PresentationError = 'PresentationError',
  TimeLimitExceeded = 'TimeLimitExceeded',
  MemoryLimitExceeded = 'MemoryLimitExceeded',
  OutpuLimitExceeded = 'OutpuLimitExceeded',
  RuntimeError = 'RuntimeError',
  CompileError = 'CompileError',
  CompileTimeLimitExceeded = 'CompileTimeLimitExceeded',
  CompileMemoryLimitExceeded = 'CompileMemoryLimitExceed',
  CompileFileLimitExceeded = 'CompileFileLimitExceed',
  SystemError = 'SystemError',
  SystemTimeLimitExceeded = 'SystemTimeLimitExceed',
  SystemMemoryLimitExceeded = 'SystemMemoryLimitExceed',
  SystemOutpuLimitExceeded = 'SystemOutpuLimitExceeded',
  SystemRuntimeError = 'SystemRuntimeError',
  SystemCompileError = 'SystemCompileError',
  Unjudged = 'Unjudged'
}
export class JudgeCompileException extends JudgeException {
  reason: JudgeErrorReason
  constructor(reason: JudgeErrorReason, message: string) {
    super(message)
    this.reason = reason
  }
}

export class JudgeRuntimeError extends JudgeException {
  reason: JudgeErrorReason
  constructor(reason: JudgeErrorReason, message: string) {
    super(message)
    this.reason = reason
  }
}
