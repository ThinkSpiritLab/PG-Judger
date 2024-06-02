/*
 * File: async.ts                                                              *
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

// calcutate execution time of a function
export async function timed<T, CastToNumber extends boolean = true>(
  fn: () => T | PromiseLike<T>,
  useMs = true,
  _doUnsafeCastToNumber: CastToNumber = true as CastToNumber
): Promise<[T, CastToNumber extends true ? number : bigint]> {
  const start = process.hrtime.bigint()
  const res = await fn()
  const end = process.hrtime.bigint()
  let diff = end - start
  if (useMs) {
    diff /= BigInt(1e6)
  }

  return [res, diff as any]
}
