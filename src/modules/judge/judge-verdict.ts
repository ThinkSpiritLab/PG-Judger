/*
 * File: judge.error.ts                                                        *
 * Project: pg-judger                                                          *
 * Created Date: Su Jul 2024                                                   *
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

/**
 * Error levels
 *
 * Layer 0 internal error
 * Layer 1 Pipeline Exception (lower exceptions) / Meter Error (violation of resource limits)
 * Layer 2 Judge Exception (lower exceptions), Compare Error
 */

// layer 2
type JudgeExceptionType = "todo" //TODO 
class JudgeException extends Error {
  constructor(
    message: string,
    public readonly reason: Error,
    public readonly type: JudgeExceptionType
  ) {
    super(message)
  }
}

type CompareResult = 'WA' | 'PE' | 'AC'
class CompareException extends Error {
  constructor(
    message: string,
    public readonly type: CompareResult
  ) {
    super(message)
  }
}

// layer 1
class PipelineFailException extends Error {
  constructor(
    message: string,
    public readonly reason: Error
  ) {
    super(message)
  }
}

type MeterExceptionType = 'TLE' | 'MLE' | 'OLE' //TODO Move this
class MeterException extends Error {
  constructor(
    message: string,
    public readonly meter: MeterResult,
    public readonly reason: MeterExceptionType
  ) {
    super(message)
  }
}
