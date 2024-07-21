/*
 * File: exec.exception.ts                                                     *
 * Project: pg-judger                                                          *
 * Created Date: Su Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Sun Jul 21 2024                                              *
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

export {
  PipelineException,
  PipelineRuntimeError,
  UnknownError,
}
