import { Injectable } from '@nestjs/common'
import { CommonCompileOption, CommonCompileStore, SimpleCompileProvider } from './pipelines/g++'
import { tmpdir } from 'os'
import { JailService } from '../jail/jail.service'
import { MeterService } from '../meter/meter.service'
import { LegacyJailService } from '../jail/jail.legacy'
import { ExecutableInfo } from '../judge/judge.service'
import { searchLangConfigByExecInfo } from './lang'
import { PipelineService } from '../pipeline/pipeline.service'

@Injectable()
export class CompileService {
  constructor(
    private readonly simpleCompileProvider: SimpleCompileProvider,
    private readonly jailService: JailService,
    private readonly legacyMeterService: MeterService,
    private readonly legacyJailService: LegacyJailService,
    private readonly pipelineService: PipelineService
  ) {
    setTimeout(() => {
      this.test2()
        .then((res) => {
          console.log('done', res)
        })
        .catch((e) => {
          console.error(e)
        })
    }, 600)
  }
  // async test() {
  //   const action = this.simpleCompileProvider.compileCppPipelineFactory({
  //     compiler: '/usr/bin/g++',
  //     source_file: 'main.cpp',
  //     source: `#include <iostream>
  //     int main() {
  //       std::cout << "Hello, World!" << std::endl;
  //       return 0;
  //     }
  //     `,
  //     target: 'main',
  //     flags: ['-O2', '-std=c++17']
  //   })

  //   await action()
  // }

  async test2() {
    const execInfo: ExecutableInfo = {
      src: {
        type: 'plain-text',
        content: `
        #include <iostream>
        int main() {
          std::cout << "Hello, World!" << std::endl;
          return 0;
        }
        `
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
    await this.compile(execInfo)
  }

  async compile(execInfo: ExecutableInfo) {
    const languageConfiguration = searchLangConfigByExecInfo(execInfo)

    if (!languageConfiguration) {
      throw new CompileException(
        'Bad ExecutableInfo: Unknown Language',
        'UNKNOWN'
      )
    }
    const { configs } = languageConfiguration

    if (!configs.compile || !configs.compile.use) {
      throw new CompileException(
        'Bad Config: missing pipeline name',
        'BAD_CONFIG'
      )
    }

    const pipelineFactory = this.pipelineService.getPipeline(configs.compile.use)
    const pipeline = pipelineFactory(configs.compile.option)

    const res = await pipeline.run<CommonCompileStore>({
      source: execInfo.src.content
    }) //add validation
    console.log(`res`, res)
  }
}

type CompileExceptionType = 'TLE' | 'MLE' | 'CE' | 'UNKNOWN' | 'BAD_CONFIG'
class CompileException extends Error {
  type: CompileExceptionType
  constructor(message: string, type: CompileExceptionType) {
    super(message)
    this.name = 'CompileException'
    this.type = type
  }
}
