/*
 * File: exec.exception.ts                                                     *
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

class PipelineException extends Error {
  constructor(message: string) {
    super(message)
  }
}

class TimeLimitExceededError extends PipelineException {
  constructor(message: string) {
    super(message)
  }
}

class MemoryLimitExceededError extends PipelineException {
  constructor(message: string) {
    super(message)
  }
}

class OutputLimitExceededError extends PipelineException {
  constructor(message: string) {
    super(message)
  }
}

class RuntimeError extends PipelineException {
  reason?: any
  constructor(message: string, reason?: any) {
    super(message)
    this.reason = reason
  }
}

class UnknownError extends PipelineException {
  constructor(message: string) {
    super(message)
  }
}

class JailViolationError extends PipelineException {
  constructor(message: string) {
    super(message)
  }
}

export {
  PipelineException,
  TimeLimitExceededError,
  MemoryLimitExceededError,
  OutputLimitExceededError,
  RuntimeError,
  UnknownError,
  JailViolationError
}
