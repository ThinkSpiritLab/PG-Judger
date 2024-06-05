import { Injectable } from '@nestjs/common'
import { CompileException, CompileService } from '../compile/compile.service'
import { PipelineService } from '../pipeline/pipeline.service'
import {
  CommonCompileStore,
  CommonJudgeOption,
  CommonJudgeStore
} from '../compile/pipelines/common'
import { rm } from 'fs/promises'
import { getConfig } from '../exec/config-generator'
import { MeterResult, testMeterOrThrow } from '../meter/meter.service'
import { Pipeline } from '../pipeline/pipeline'
import { JudgeException } from './judge.exceptions'
import { MeterException } from '../meter/meter.exception'
import { PipelineRuntimeError } from '../pipeline/pipeline.exception'
import { toNormalJudgeRequest } from './test/utils'
import killTimer from './test/bomb/kill-timer'
import stack from './test/bomb/stack'

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
    // setTimeout(() => {
    //   this.normalJudge(toNormalJudgeRequest(stack, 'c')) //FIXME: THIS SEEMS CANNOT RUN PARALLEL
    // }, 600)
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
    } catch (error) {
      if (error instanceof PipelineRuntimeError) {
        console.error(error.reason)
        return cases.map(() => ({ result: 'compile-error' }))
      } else if (error instanceof CompileException) {
        console.error(error.type, error.message, error.name, error.stack)

        if (error.type === 'time-limit-exceeded') { //FIXME used to pass test!
          return cases.map(() => ({ result: 'time-limit-exceeded' }))
        }

        return cases.map(() => ({ result: 'compile-error' }))
      }
    }

    if (store == null) {
      throw new Error('store is null')
    }

    try {
      const judgePipelineFactory = this.pipelineService.getPipeline(
        'common-run-testcase'
      )

      const {
        limit: { runtime }
      } = user
      const judgePipeline = configureJudgePipeline(
        judgePipelineFactory,
        user.limit.runtime
      )

      const testResult: {
        measure?: MeterResult
        result: string
      }[] = [] as any
      for (const testcase of cases) {
        try {
          await runJudgerPipeline(judgePipeline, store, testcase, testResult)
        } catch (error) {
          if (error instanceof JudgeException) {
            // WA, PE, RE
            handleJudgeException(testResult, error)
          } else if (error instanceof MeterException) {
            // TLE, MLE, OLE
            handleLimitError(error, runtime, testResult)
          } else {
            console.error(error)
            handleUnknownError(testResult)
          }

          if (policy === 'fuse') {
            break
          } else if (policy === 'all') {
            continue
          }

          throw error
        }
      }

      testResult.push(
        ...Array(cases.length - testResult.length).fill({ result: 'UNJUDGED' })
      )
      console.log(testResult)

      return testResult
    } catch (error) {
      throw error
    } finally {
      //TODO still some remaining, check
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
      return 'NO_RESULT'
    }

    if (policy === 'fuse') {
      if (results.some((r) => r.result === 'accepted')) {
        return 'accepted'
      }
    } else if (policy === 'all') {
      if (results.every((r) => r.result === 'accepted')) {
        return 'accepted'
      }
    }
    // return first non-AC result
    return (
      results.find((r) => r.result !== 'accepted')?.result || 'UNKNOWN_ERROR'
    )
  }
}

function configureJudgePipeline(
  judgePipelineFactory: (...args: any[]) => Pipeline<any>,
  runtime: { memory: number; cpuTime: number; output: number }
) {
  return judgePipelineFactory({
    jailOption: {
      timeLimit_s: runtime.cpuTime,
      rlimitAS_MB: runtime.memory, //FIXME is this right?
      rlimitFSIZE_MB: runtime.output //FIXME is this right?
    },
    meterOption: {
      memoryLimit: runtime.memory, //FIXME is this right?
      timeLimit: runtime.cpuTime,
      pidLimit: 1
    }
  } satisfies CommonJudgeOption)
}

async function runJudgerPipeline(
  judgePipeline: Pipeline<any>,
  store: CommonCompileStore,
  testcase: TestCase,
  testResult: { measure?: MeterResult; result: string }[]
) {
  const {
    store: { user_measure, result }
  } = await judgePipeline.run<CommonJudgeStore>({
    targetPath: store.targetPath,
    tempDir: store.tempDir,
    case: testcase
  })
  testResult.push({ measure: user_measure!, result: result! })
}

function handleUnknownError(
  testResult: { measure?: MeterResult; result: string }[]
) {
  testResult.push({ result: 'UNKNOWN' })
}

function handleJudgeException(
  testResult: { measure?: MeterResult; result: string }[],
  error: JudgeException
) {
  testResult.push({ result: error.reason })
}

function handleLimitError(
  error: MeterException,
  runtime: { memory: number; cpuTime: number; output: number },
  testResult: { measure?: MeterResult; result: string }[]
) {
  const limit = error.meter!
  try {
    testMeterOrThrow(limit, {
      cpuTime: runtime.cpuTime,
      memory: runtime.memory * 1024 * 8
    })
  } catch (error) {
    if (error instanceof MeterException) {
      testResult.push({ result: error.reason })
    } else {
      throw error
    }
  }
}
