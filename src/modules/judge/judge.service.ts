import { Injectable } from '@nestjs/common'
import { CompileException, CompileService } from '../compile/compile.service'
import { PipelineService } from '../pipeline/pipeline.service'
import {
  CommonCompileStore,
  CommonJudgeOption,
  CommonJudgeStore
} from '../compile/pipelines/common'
import { rm } from 'fs/promises'
import { MeterResult, testMeterOrThrow } from '../meter/meter.service'
import { Pipeline } from '../pipeline/pipeline'
import { JudgeException } from './judge.exceptions'
import { MeterException } from '../meter/meter.exception'
import { PipelineRuntimeError } from '../pipeline/pipeline.exception'
import { toNormalJudgeRequest } from './test/utils'
import stack from './test/bomb/stack'
import { withTempDir } from '../compile/pipelines/utils'
import { ThrowUtils } from '@/utils/throw'
import { JudgeResultBuilder } from './judge-result'
import AC from './test/cpp/AC'
import CE from './test/cpp/CE'
import TLE from './test/cpp/TLE'
import MLE from './test/cpp/MLE'

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
const compileErrorSubtype = [
  'time-limit-exceeded',
  'memory-limit-exceeded'
  // 'output-limit-exceeded' //TODO add this
]
@Injectable()
export class JudgeService {
  constructor(
    private readonly compileService: CompileService,
    private readonly pipelineService: PipelineService
  ) {
    setTimeout(() => {
      this.judge(toNormalJudgeRequest(AC, 'cpp')) //FIXME: THIS SEEMS CANNOT RUN PARALLEL
      this.judge(toNormalJudgeRequest(AC, 'cpp'))
    }, 600)
  }

  async judge(req: JudgeRequest) {
    switch (req.type) {
      case 'normal':
        return await this.normalJudge(req)
      case 'spj':
        return await this.spjJudge(req)
      case 'interactive':
        return await this.interactiveJudge(req)
    }

    throw new Error('Unknown judge request type')
  }

  async normalJudge({ cases, user, policy }: NormalJudgeRequest) {
    return await withTempDir(async (tempDir) => {
      const judgeResult = new JudgeResultBuilder(cases)
      let store: CommonCompileStore | null = null

      try {
        // compile
        store = await this.compile(store, user, tempDir, judgeResult)
        // run testcases
        try {
          const judgeFactory = this.pipelineService.getPipeline(
            'common-run-testcase'
          )

          const {
            limit: { runtime }
          } = user
          const judgePipeline = configureJudgePipeline({
            judgeFactory,
            runtime
          })

          try {
            for (const testcase of cases) {
              await this.runTestcase(
                judgePipeline,
                store,
                testcase,
                judgeResult,
                runtime,
                policy
              )
            }
          } catch (error) {
            if (error instanceof TestcaseFuseException) {
              return judgeResult.results
            }
            throw error
          }

          console.log(judgeResult.results)

          return judgeResult.results
        } catch (error) {
          throw error
        }
      } catch (error) {
        if (error instanceof JudgeInterruptedException) {
          console.warn('Judge interrupted, results:', judgeResult.results)
          return judgeResult.results
        }
        throw error
      }
    })
  }

  private async compile(
    store: CommonCompileStore | null,
    user: ExecutableInfo,
    tempDir: string,
    judgeResult: JudgeResultBuilder
  ) {
    try {
      store = (await this.compileService.compile(user, { tempDir }))
        .store as CommonCompileStore
    } catch (error) {
      //TODO refactor this
      if (error instanceof PipelineRuntimeError) {
        judgeResult.fill({ result: 'compile-error' })
        throw new JudgeInterruptedException()
      } else if (error instanceof CompileException) {
        if (compileErrorSubtype.includes(error.type)) {
          // FIXME used to pass test!
          judgeResult.fill({ result: error.type })
        } else {
          judgeResult.fill({ result: 'compile-error' })
        }
        throw new JudgeInterruptedException()
      }
      throw error
    }
    return store
  }

  private async runTestcase(
    judgePipeline: Pipeline<any>,
    store: CommonCompileStore,
    testcase: TestCase,
    judgeResult: JudgeResultBuilder,
    runtime: { memory: number; cpuTime: number; output: number },
    policy: TestPolicy
  ) {
    try {
      await runJudgerPipeline(judgePipeline, store, testcase, judgeResult)
    } catch (error) {
      if (error instanceof JudgeException) {
        handleJudgeException(judgeResult, error)
      } else if (error instanceof MeterException) {
        handleLimitError(error, runtime, judgeResult)
      } else {
        console.error(error)
        handleUnknownError(judgeResult)
        throw error
      }

      if (policy === 'fuse') {
        throw new TestcaseFuseException()
      } else if (policy === 'all') {
        // do nothing
      }
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

function configureJudgePipeline({
  judgeFactory,
  runtime
}: {
  judgeFactory: (...args: any[]) => Pipeline<any>
  runtime: { memory: number; cpuTime: number; output: number }
}) {
  return judgeFactory({
    jailOption: {
      timeLimit_s: runtime.cpuTime,
      rlimitAS_MB: runtime.memory, //FIXME is this right?
      rlimitFSIZE_MB: runtime.output //FIXME is this right?
    },
    meterOption: {
      memoryLimit: runtime.memory, //FIXME is this right?
      timeLimit: runtime.cpuTime,
      pidLimit: 1 //TODO check this
    }
  } satisfies CommonJudgeOption)
}

async function runJudgerPipeline(
  judgePipeline: Pipeline<any>,
  store: CommonCompileStore,
  testcase: TestCase,
  testResult: JudgeResultBuilder
) {
  const {
    store: { user_measure, result }
  } = await judgePipeline.run<CommonJudgeStore>({
    targetPath: store.targetPath,
    case: testcase,
    tempDir: store.tempDir
  })
  testResult.push({ measure: user_measure!, result: result! })
}

function handleUnknownError(testResult: JudgeResultBuilder) {
  testResult.push({ result: 'UNKNOWN' })
}

/** WA, PE, RE */
function handleJudgeException(
  testResult: JudgeResultBuilder,
  error: JudgeException
) {
  testResult.push({ result: error.reason })
}

/** TLE, MLE, OLE */
function handleLimitError(
  error: MeterException,
  runtime: { memory: number; cpuTime: number; output: number },
  testResult: JudgeResultBuilder
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

class TestcaseFuseException extends Error {
  constructor() {
    super('Fuse')
  }
}

class JudgeInterruptedException extends Error {
  constructor() {
    super('Interrupted')
  }
}
