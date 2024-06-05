/*
 * File: exec.exception.ts                                                     *
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

import { MeterResult } from '../meter/meter.service'

type PipelineErrorReason =
  // | 'time-limit-exceeded'
  // | 'memory-limit-exceeded'
  // | 'output-limit-exceeded'
  | 'runtime-error'
  // | 'limit-violation'
  | 'unknown'

class PipelineException extends Error {
  constructor(
    public message: string,
    public reason: PipelineErrorReason,
    // public meter?: MeterResult
  ) {
    super(message)
  }
}

// class TimeLimitExceededError extends PipelineException {
//   constructor(message: string, meter?: MeterResult) {
//     super(message, 'time-limit-exceeded', meter)
//     // super(message, 'time-limit-exceeded', meter)
//   }
// }

// class MemoryLimitExceededError extends PipelineException {
//   constructor(message: string, meter?: MeterResult) {
//     super(message, 'memory-limit-exceeded', meter)
//   }
// }

// class OutputLimitExceededError extends PipelineException {
//   constructor(message: string, meter?: MeterResult) {
//     super(message, 'output-limit-exceeded', meter)
//   }
// }

class PipelineRuntimeError extends PipelineException {
  constructor(message: string, reason: PipelineErrorReason) {
    super(message, reason)
  }
}

class UnknownError extends PipelineException {
  constructor(message: string) {
    super(message, 'unknown')
  }
}

// class LimitViolationError extends PipelineException {
//   constructor(message: string, meter?: MeterResult) {
//     super(message, 'limit-violation', meter)
//   }
// }

export {
  PipelineException,
  PipelineRuntimeError,
  UnknownError,
}
