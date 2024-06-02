import { Injectable } from '@nestjs/common'
import { CompileService } from '../compile/compile.service'
import { PipelineService } from '../pipeline/pipeline.service'
import {
  CommonCompileStore,
  CommonJudgeOption,
  CommonJudgeStore
} from '../compile/pipelines/common'
import { rm } from 'fs/promises'
import { JudgeRuntimeError } from './judge.exceptions'

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
  constructor(
    private readonly compileService: CompileService,
    private readonly pipelineService: PipelineService
  ) {
    setTimeout(() => {
      this.test()
    }, 600)
  }

  async test() {
    const execInfo: ExecutableInfo = {
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
    const policy: TestPolicy = 'fuse'
    const compileRes = await this.compileService.compile(execInfo)
    const store = compileRes.store as CommonCompileStore
    // console.log('compile phase done', store)

    const judgePipelineFactory = this.pipelineService.getPipeline(
      'common-run-testcase'
    )

    const testcases = [
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
    ]

    for(const testcase of testcases) {
      const judgePipeline = judgePipelineFactory({
        case: testcase,
        jailOption: {
          uidMap: [{inside: 0, outside: 0, count: 1}],
          gidMap: [{inside: 0, outside: 0, count: 1}],
        },
        meterOption: {},
      } satisfies CommonJudgeOption)
  
      try {
        const judgeRes = await judgePipeline.run<CommonJudgeStore>({
          targetPath: store.targetPath,
          tempDir: store.tempDir,
        })
      } catch (error) {
        if (error instanceof JudgeRuntimeError) {
          if (policy === 'fuse') {
            console.log('fuse! result is', error.reason)
            break
          } else if (policy === 'all') {
            continue
          }
        }
      }
    }

    const temp_dir = store.tempDir
    // clean up
    rm(temp_dir, {recursive: true})
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
  }

  async normalJudge(req: NormalJudgeRequest) {
    const compileRes = await this.compileService.compile(req.user)
    const store = compileRes.store as CommonCompileStore

    const judgePipelineFactory = this.pipelineService.getPipeline(
      'common-run-testcase'
    )

    for (const testcase of req.cases) {
      const judgePipeline = judgePipelineFactory({
        case: testcase,
        jailOption: {
          uidMap: [{inside: 0, outside: 0, count: 1}],
          gidMap: [{inside: 0, outside: 0, count: 1}],
        },
        meterOption: {},
      } satisfies CommonJudgeOption)

      const judgeRes = await judgePipeline.run<CommonJudgeStore>({
        targetPath: store.targetPath,
        tempDir: store.tempDir,
      })
    }

    const temp_dir = store.tempDir
    // clean up
    rm(temp_dir, {recursive: true})
  }

  async spjJudge(req: SpjJudgeRequest) {
    // TODO
  }

  async interactiveJudge(req: InteractiveJudgeRequest) {
    // TODO
  }
}
