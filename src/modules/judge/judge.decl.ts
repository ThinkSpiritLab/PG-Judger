/*
 * File: judge.decl.ts                                                         *
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

// TODO or use {sender: string, error: string} instead of string
// sender is the name of the sender of the error: System, Userprogram, etc.
// error is the error message

const CompileTimeError = [
  'compile-time-limit-exceeded',
  'compile-memory-limit-exceed',
  'compile-file-limit-exceed',
  'compile-output-limit-exceeded',
  'system-compile-error'
] as const

type CompileTimeErrorType = (typeof CompileTimeError)[number]

const RuntimeUserError = [
  'time-limit-exceeded',
  'memory-limit-exceeded',
  'output-limit-exceeded',
  'runtime-error'
] as const

type RuntimeUserErrorType = (typeof RuntimeUserError)[number]

const RuntimeSystemError = [
  'system-timeLimit-exceed',
  'system-memoryLimit-exceed',
  'system-outpuLimit-exceeded',
  'system-runtime-error',
  'system-error'
] as const

type RuntimeSystemErrorType = (typeof RuntimeSystemError)[number]

const JudgeError = ['wrong-answer', 'presentation-error', 'unjudged'] as const

type JudgeErrorType = (typeof JudgeError)[number]

const JudgeSuccess = ['accepted'] as const

type JudgeSuccessType = (typeof JudgeSuccess)[number]

type JudgeResultType =
  | JudgeSuccessType
  | JudgeErrorType
  | CompileTimeErrorType
  | RuntimeUserErrorType
  | RuntimeSystemErrorType

export {
  JudgeResultType,
  CompileTimeErrorType,
  RuntimeUserErrorType,
  RuntimeSystemErrorType,
  JudgeErrorType,
  JudgeSuccessType
}
