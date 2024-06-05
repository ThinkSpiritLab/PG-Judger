import { Injectable } from '@nestjs/common'
import { ExecutableInfo } from '../judge/judge.service'
import { searchLangConfigByExecInfo } from '../../lang'
import { PipelineService } from '../pipeline/pipeline.service'
import { PipelineRuntimeError } from '../pipeline/pipeline.exception'
import { MeterException } from '../meter/meter.exception'

@Injectable()
export class CompileService {
  constructor(
    private readonly pipelineService: PipelineService
  ) {}

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
    return await this.compile(execInfo)
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

    const pipelineFactory = this.pipelineService.getPipeline(
      configs.compile.use
    )
    const pipeline = pipelineFactory(configs.compile.option)

    try {
      return await pipeline.run({
        source: execInfo.src.content
      }) //TODO add validation
    } catch (error) {
      if (error instanceof PipelineRuntimeError) {
        throw new CompileException(
          error.message,
          'pipeline-error'
        )
      }
      if (error instanceof MeterException) {
        throw new CompileException(
          error.message,
          'meter-error'
        )
      }
      throw error
    }
  }
}

export class CompileException extends Error {
  constructor(message: string, public type: string) {
    super(message)
  }
}
