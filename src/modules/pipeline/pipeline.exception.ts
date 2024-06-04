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

class MeterException extends Error {
  constructor(
    public message: string,
    public reason: any,
    public meter?: MeterResult
  ) {
    super(message)
  }
}

class TimeLimitExceededError extends MeterException {
  constructor(message: string, meter?: MeterResult) {
    super(message, 'time-limit-exceeded', meter)
  }
}

class MemoryLimitExceededError extends MeterException {
  constructor(message: string, meter?: MeterResult) {
    super(message, 'memory-limit-exceeded', meter)
  }
}

class OutputLimitExceededError extends MeterException {
  constructor(message: string, meter?: MeterResult) {
    super(message, 'output-limit-exceeded', meter)
  }
}

class PipelineRuntimeError extends MeterException {
  constructor(
    message: string, reason: string, meter?: MeterResult
  ) {
    super(message, reason, meter)
  }
}

class UnknownError extends MeterException {
  constructor(message: string) {
    super(message, 'unknown')
  }
}

class LimitViolationError extends MeterException {
  constructor(message: string, meter?: MeterResult) {
    super(message, 'limit-violation', meter)
  }
}

export {
  MeterException,
  TimeLimitExceededError,
  MemoryLimitExceededError,
  OutputLimitExceededError,
  PipelineRuntimeError,
  UnknownError,
  LimitViolationError
}
