/*
 * File: async.ts                                                              *
 * Project: pg-judger                                                          *
 * Created Date: Su Jun 2024                                                   *
 * Author: Yuzhe Shi                                                           *
 * -----                                                                       *
 * Last Modified: Tue Jun 11 2024                                              *
 * Modified By: Yuzhe Shi                                                      *
 * -----                                                                       *
 * Copyright (c) 2024 Nanjing University of Information Science & Technology   *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                     *
 * ----------	---	---------------------------------------------------------    *
 */

// calcutate execution time of a function
export async function timed<T>(
  fn: () => T | PromiseLike<T>,
  _timeout?: number
): Promise<[T, number]> {
  const start = process.hrtime.bigint()
  // const res = await fn()
  const res = _timeout ? await timeout(fn, _timeout) : await fn()
  const end = process.hrtime.bigint()
  let diff = end - start
  diff /= BigInt(1e6)

  return [res, Number(diff)] // unsafe cast
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// timeout a promise
export async function timeout<T>(
  fn: () => PromiseLike<T> | T,
  ms: number
): Promise<T> {
  let timeoutId: NodeJS.Timeout | null = null

  try {
    return await Promise.race([
      fn(),
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('timeout'))
        }, ms)
      })
    ])
  } finally {
    timeoutId && clearTimeout(timeoutId)
  }
}
