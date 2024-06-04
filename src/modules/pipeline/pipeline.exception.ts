/*
 * File: exec.exception.ts                                                     *
 * Project: pg-judger                                                          *
 * Created Date: Su Jun 2024                                                   *
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

import { MeterResult } from '../meter/meter.service'

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

class PipelineRuntimeError extends PipelineException {
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

class LimitViolationError extends PipelineException {
  constructor(
    message: string,
    public measure: MeterResult
  ) {
    super(message)
  }
}

export {
  PipelineException,
  TimeLimitExceededError,
  MemoryLimitExceededError,
  OutputLimitExceededError,
  PipelineRuntimeError,
  UnknownError,
  LimitViolationError
}
