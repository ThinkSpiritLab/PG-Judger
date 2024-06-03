import { Injectable } from '@nestjs/common'
import { CompileService } from '../compile/compile.service'
import { PipelineService } from '../pipeline/pipeline.service'
import {
  CommonCompileStore,
  CommonJudgeOption,
  CommonJudgeStore
} from '../compile/pipelines/common'
import { rm } from 'fs/promises'
import { JudgeCompileError, JudgeRuntimeError } from './judge.exceptions'
import { getConfig } from '../exec/config-generator'
import { MeterResult } from '../meter/meter.service'

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
export type TestCase = {
  input: string
  output: string
}
export type TestPolicy = 'fuse' | 'all'

export type NormalJudgeRequest = BaseJudgeRequest & {
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
  constructor(
    private readonly compileService: CompileService,
    private readonly pipelineService: PipelineService
  ) {
    setTimeout(() => {
      this.normalJudge({
        id: '1',
        cases: [
          {
            input: '1 1\n',
            output: '2\n'
          },
          {
            input: '2 2\n',
            output: '114514\n'
          },
          {
            input: '3 3\n',
            output: '6\n'
          },
          {
            input: '4 4\n',
            output: '8\n'
          },
          {
            input: '5 5\n',
            output: '10\n'
          }
        ],
        policy: 'all',
        type: 'normal',
        user: {
          src: {
            type: 'plain-text',
            content: `
            #include <iostream>
            using namespace std;
            int main() {
              int a, b;
              cin >> a >> b;
              cout << a + b << endl;
              return 0;
            }
            `
            // content: `
            // int main() {
            //   return 1;
            // }
            // `
          },
          env: {
            lang: 'cpp',
            arch: 'x64',
            options: {},
            system: 'linux'
          },
          limit: {
            compiler: {
              cpuTime: 1000,
              memory: 1024,
              message: 1024,
              output: 1024
            },
            runtime: {
              cpuTime: 1000,
              memory: 1024,
              output: 1024
            }
          }
        }
      })
    }, 600)
  }

  async judge(req: JudgeRequest) {
    switch (req.type) {
      case 'normal':
        return this.normalJudge(req)
      case 'spj':
        return this.spjJudge(req)
      case 'interactive':
        return this.interactiveJudge(req) 
    }

    throw new Error('Unknown judge request type')
  }

  async normalJudge({ cases, user, policy }: NormalJudgeRequest) {
    let store: CommonCompileStore | null = null
    try {
      store = (await this.compileService.compile(user))
        .store as CommonCompileStore

      const judgePipelineFactory = this.pipelineService.getPipeline(
        'common-run-testcase'
      )

      const {
        limit: { runtime }
      } = user
      const judgePipeline = judgePipelineFactory({
        jailOption: {
          timeLimit_s: runtime.cpuTime,
          rlimitAS_MB: runtime.memory * 1024 * 8, //FIXME is this right?
          rlimitFSIZE_MB: runtime.output * 1024 * 8 //FIXME is this right?
        },
        meterOption: {
          memoryLimit: runtime.memory * 1024 * 8, //FIXME is this right?
          timeLimit: runtime.cpuTime,
          pidLimit: 1
        }
      } satisfies CommonJudgeOption)

      const testResult: {
        measure?: MeterResult
        result: string
      }[] = [] as any
      for (const testcase of cases) {
        try {
          const {
            store: { user_measure, result }
          } = await judgePipeline.run<CommonJudgeStore>({
            targetPath: store.targetPath,
            tempDir: store.tempDir,
            case: testcase
          })
          testResult.push({ measure: user_measure!, result: result! })
        } catch (error) {
          if (error instanceof JudgeRuntimeError) {
            testResult.push({ result: error.reason })

            if (policy === 'fuse') {
              console.log('fuse! result is', error.reason)
              break
            } else if (policy === 'all') {
              continue
            }
          }

          //TODO ... if other known exceptions
          testResult.push({ result: 'UNKNOWN' })
          throw error
        }
      }
      // if shorter than cases, then it's a fuse
      // append the result with 'UNJUDGED'
      testResult.push(
        ...Array(cases.length - testResult.length).fill({ result: 'UNJUDGED' })
      )
      console.log(testResult)
      //TODO
      // we also do summary here
      // if all test cases are AC, then return AC
      // if any compile time error, show compile error
      // then if any runtime error, show runtime error

      return testResult
    } catch (error) {
      if (error instanceof JudgeCompileError) {
        console.log('compile error', error.message)

        // return results filled with compile error
        return cases.map(() => ({ result: 'CE' }))
      }
      throw error //FIXME check this
      //TODO ... if other known exceptions
    } finally {
      // clean up
      store && rm(store.tempDir, { recursive: true })
    }
  }

  async spjJudge(req: SpjJudgeRequest) {
    // TODO
    throw new Error('Not implemented')
    return null
  }

  async interactiveJudge(req: InteractiveJudgeRequest) {
    // TODO
    throw new Error('Not implemented')
    return null
  }

  summaryResult(
    results: {
      measure?: MeterResult
      result: string
    }[],
    policy: TestPolicy
  ) {
    if (!results) {
      return 'UNKNOWN'
    }

    if (policy === 'fuse') {
      if (results.some((r) => r.result === 'AC')) {
        return 'AC'
      }
    } else if (policy === 'all') {
      if (results.every((r) => r.result === 'AC')) {
        return 'AC'
      }
    }
    // return first non-AC result
    return results.find((r) => r.result !== 'AC')?.result || 'UNKNOWN'
  }
}
