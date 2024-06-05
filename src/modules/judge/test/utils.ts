/*
 * File: utils.ts                                                              *
 * Project: pg-judger                                                          *
 * Created Date: Tu Jun 2024                                                   *
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

import { NormalJudgeRequest } from '../judge.service'

export type JudgeTest = {
  name: string
  usrCode: string
  input: string
  output: string
  expectResult: string
  limit?: {
    runtime?: {
      memory: 1024
      cpuTime: 1000
      output: 1024
    }
    compiler?: {
      memory: 1024
      cpuTime: 1000
      output: 1024
      message: 1024
    }
  }
}

export function toNormalJudgeRequest(judgeTest: JudgeTest, lang: string): NormalJudgeRequest {
  return {
    id: '1',
    user: {
      src: {
        type: 'plain-text',
        content: judgeTest.usrCode
      },
      limit: {
        runtime: judgeTest.limit?.runtime || {
          memory: 1024,
          cpuTime: 1000,
          output: 1024
        },
        compiler: judgeTest.limit?.compiler || {
          memory: 1024,
          cpuTime: 1000,
          output: 1024,
          message: 1024
        }
      },
      env: {
        arch: 'x64',
        lang,
        options: {},
        system: 'linux'
      }
    },
    cases: [
      {
        input: judgeTest.input,
        output: judgeTest.output
      }
    ],
    policy: 'all',
    type: 'normal'
  }
}
