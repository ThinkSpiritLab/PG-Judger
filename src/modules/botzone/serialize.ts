/*
 * File: decl.ts                                                               *
 * Project: pg-judger                                                          *
 * Created Date: Sa Jun 2024                                                   *
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

export type SerializableObject = Record<string, any>
export function serialize(obj: SerializableObject): string {
  // create single line string
  return JSON.stringify(obj, null, 0)
}

export function deserialize(str: string): SerializableObject {
  return JSON.parse(str)
}

export function trySerialize(obj: any): [string, boolean] {
  try {
    return [serialize(obj), true]
  } catch (e) {
    return ['', false]
  }
}

export function tryDeserialize(str: string): [SerializableObject, boolean] {
  try {
    return [deserialize(str), true]
  } catch (e) {
    return [{}, false]
  }
}