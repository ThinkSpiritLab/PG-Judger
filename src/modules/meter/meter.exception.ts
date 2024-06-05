/*
 * File: meter.exception.ts                                                    *
 * Project: pg-judger                                                          *
 * Created Date: We Jun 2024                                                   *
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

import { MeterResult } from "./meter.service"

type MeterErrorReason =
  | 'output-limit-exceeded'
  | 'runtime-error'
  | 'memory-limit-exceeded'
  | 'time-limit-exceeded'

export class MeterException extends Error {
  constructor(public reason: MeterErrorReason, public meter: MeterResult | null, message?: string) {
    super(message)
  }
}
