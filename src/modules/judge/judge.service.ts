import { Injectable } from '@nestjs/common'

// TODO 支持交互式(流)：将用户程序的标准输入输出接到interactor程序
// [用户输入 用户输出 交互程序错误 样例输入FD 样例输出FD ignore]

export interface Limit {
  runtime: {
    memory: number
    cpuTime: number
    output: number
  }
  compiler: {
    memory: number
    cpuTime: number
    output: number
    message: number
  }
}

type ExecutableSource = {
  type: 'plain-text'
  content: string
}

export type ExecutableInfo = {
  src: ExecutableSource
  env: {
    lang: string
    system: 'windows' | 'linux' | 'darwin'
    arch: 'x64' | 'arm' | 'risc-v' | 'powerpc' | 'mips'
    options: {
      [key: string]: string | number | boolean
    }
  }
  limit: Limit
}

type BaseJudgeRequest = {
  id: string
}
type TestCase = {
  input: string
  output: string
}
type TestPolicy = 'fuse' | 'all'

type NormalJudgeRequest = BaseJudgeRequest & {
  user: ExecutableInfo
  cases: TestCase[]
  policy: TestPolicy
} & { type: 'normal' }

type SpjJudgeRequest = BaseJudgeRequest & {
  user: ExecutableInfo
  spj: ExecutableInfo
  cases: TestCase[]
  policy: TestPolicy
} & { type: 'spj' }

type InteractiveJudgeRequest = BaseJudgeRequest & {
  user: ExecutableInfo
  interactor: ExecutableInfo
  cases: TestCase[]
  policy: TestPolicy
} & { type: 'interactive' }

type JudgeRequest =
  | NormalJudgeRequest
  | SpjJudgeRequest
  | InteractiveJudgeRequest
@Injectable()
export class JudgeService {


  async judge(req: JudgeRequest) {
    switch (req.type) {
      case 'normal':
        return this.normalJudge(req)
      case 'spj':
        return this.spjJudge(req)
      case 'interactive':
        return this.interactiveJudge(req)
    }
  }

  async normalJudge(req: NormalJudgeRequest) {
    
  }

  async spjJudge(req: SpjJudgeRequest) {
    // TODO
  }

  async interactiveJudge(req: InteractiveJudgeRequest) {
    // TODO
  }
}
